import { prisma } from "../common/prisma/connect.prisma.js";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";
import {
    v2 as cloudinary
} from 'cloudinary'

export const productService = {
    async findAll (req) {
        const { index, page, pageSize, where } = buildQueryPrisma(req);

        // const resultSequelize = await product.findAll();
        const resultPrismaPromise = prisma.products.findMany({
            where: where,
            include: {
                categories: {
                    select: {
                        name: true
                    }
                },
                product_quantities: {
                    select: {
                        quantities: {
                            select: {
                                id: true,
                                name: true
                            }
                        },
                        price: true,
                        id: true
                    }
                }
            },
            skip: index,
            take: pageSize
        });

        const totalItemsPromise = prisma.products.count({
            where: where
        });
        const [resultPrisma, totalItems] = await Promise.all([resultPrismaPromise, totalItemsPromise]);
        const totalPage = Math.ceil(totalItems / pageSize);

        const CATEGORY_ORDER = [6, 1, 2, 3, 4, 5];

        // Tạo map để tra cứu thứ tự nhanh O(1)
        const categoryOrderMap = CATEGORY_ORDER.reduce((acc, catId, index) => {
            acc[catId] = index;
            return acc;
        }, {});

        const sortedFinalProducts = resultPrisma.sort((a, b) => {
            const orderA = categoryOrderMap[a.category_id] ?? 999;
            const orderB = categoryOrderMap[b.category_id] ?? 999;

            if (orderA !== orderB) return orderA - orderB;

            return 0;
        });
        
        return {
            totalItem: totalItems,
            totalPage: totalPage,
            page: page,
            items: sortedFinalProducts
        };
    },

    async findOne(req){
        const { productId } = req.params;
        const product = await prisma.products.findUnique({
            where: {
                id: Number(productId),
                isDeleted: 0
            },
            include: {
                categories: {
                    select: {
                        name: true
                    }
                },
                product_quantities: {
                    select: {
                        id: true,
                        product_id: true,
                        price: true,
                        quantities: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })
        return product
    },

    async create (req) {
        const { category_id, name, short_description, detailed_description, quantities } = req.body;

        // Validate: quantities phải là array và không được rỗng
        if (!quantities || !Array.isArray(quantities) || quantities.length === 0) {
            throw new BadRequestException("quantities phải là mảng và không được rỗng. Mỗi item cần có quantity_id và price");
        }

        // Validate từng quantity item
        for (let qty of quantities) {
            if (!qty.quantity_id || qty.price === undefined) {
                throw new BadRequestException("Mỗi quantity item phải có quantity_id và price");
            }
        }

        const result = await prisma.$transaction(async (tx) => {
            // Tạo product trước
            const newProduct = await tx.products.create({
                data: {
                    category_id: Number(category_id),
                    name: name,
                    short_description: short_description,
                    detailed_description: detailed_description,
                    createdAt: new Date()
                }
            });

            // Tạo nhiều product_quantities cho product này
            const productQuantities = await tx.product_quantities.createMany({
                data: quantities.map(qty => ({
                    product_id: newProduct.id,
                    quantity_id: Number(qty.quantity_id),
                    price: Number(qty.price),
                    createdAt: new Date()
                }))
            });

            return { newProduct, productQuantities };
        });
        return {
            id: result.newProduct.id
        };
    },

    /**
     * Thêm quantity cho một product đã tồn tại
     * POST /:productId/quantities
     */
    async addQuantityToProduct (req) {
        const { productId } = req.params;
        const { quantity_id, price } = req.body;

        // Validate
        if (!quantity_id || price === undefined) {
            throw new BadRequestException("quantity_id và price là bắt buộc");
        }

        // Check product tồn tại
        const product = await prisma.products.findUnique({
            where: { id: Number(productId) }
        });

        if (!product) {
            throw new BadRequestException("Sản phẩm không tồn tại");
        }

        // Check quantity đã tồn tại cho product này chưa (để tránh duplicate)
        const existingQty = await prisma.product_quantities.findUnique({
            where: {
                product_id_quantity_id: {
                    product_id: Number(productId),
                    quantity_id: Number(quantity_id)
                }
            }
        });

        if (existingQty) {
            throw new BadRequestException("Quantity này đã tồn tại cho sản phẩm này. Hãy dùng update để sửa giá");
        }

        // Thêm quantity mới
        const newQuantity = await prisma.product_quantities.create({
            data: {
                product_id: Number(productId),
                quantity_id: Number(quantity_id),
                price: Number(price),
                createdAt: new Date()
            },
            include: {
                quantities: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return newQuantity;
    },

    async postImage (req){
        if (!req.file) {
            throw new BadRequestException("Không có file")
        }

        const { productId } = req.params;


        const product = await prisma.products.findUnique({
            where: {
                id: Number(productId)
            }
        })

        if (!product) {
            throw new BadRequestException("Sản phẩm không tồn tại");
        }

        // Delete old image from Cloudinary if exists
        if (product.image_link){
            cloudinary.uploader.destroy(product.image_link)
        }


        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({
                folder: "mermys"
            }, (error, uploadResult) => {
                if (error) {
                    return reject(error);
                }
                return resolve(uploadResult);
            }).end(req.file.buffer);
        });

        await prisma.products.update({
            where: {
                id: product.id
            },
            data: {
                image_link: uploadResult.public_id
            }
        })

        console.log({
            "req.file": req.file,
            "req.body": req.body,
            "req.user": req.user,
            "uploadResult": uploadResult
        })
        return uploadResult.secure_url;

    },
    // PARAMETERS thường dùng để lấy detail, gửi id, update, delete
    async update(req) {
        const { productId } = req.params;
        const { quantity_id, ...rest } = req.body;

        // convert an toàn
        if (rest.category_id !== undefined) {
            rest.category_id = Number(rest.category_id);
        }

        if (rest.isDeleted !== undefined) {
            rest.isDeleted = Number(rest.isDeleted) === 1;
        }

        const productData = {};
        const quantityData = {};

        const quantityFields = ["price"];
        const productFields = ["name", "short_description", "detailed_description", "category_id", "isDeleted"];

        for (let key in rest) {
            if (productFields.includes(key)) {
                productData[key] = rest[key];
            }
            if (quantityFields.includes(key)) {
                quantityData[key] = rest[key];
            }
        }

        const product = await prisma.products.findUnique({
            where: { id: Number(productId) }
        });

        if (!product) {
            throw new BadRequestException("product does not exist");
        }

        const result = await prisma.$transaction(async (tx) => {

            let newProduct = null;
            let newPrice = null;

            if (Object.keys(productData).length > 0) {
                newProduct = await tx.products.update({
                    where: { id: Number(productId) },
                    data: productData
                });
            }

            if (Object.keys(quantityData).length > 0 && quantity_id) {
                newPrice = await tx.product_quantities.update({
                    where: {
                        product_id_quantity_id: {
                            product_id: Number(productId),
                            quantity_id: Number(quantity_id)
                        }
                    },
                    data: quantityData,
                    select: { price: true }
                });
            }

            return { newProduct, newPrice };
        });

        return result;
    },

    async delete(req){
        const { productId } = req.params;

        // const deletedproduct = await prisma.products.delete({
        //     where: {
        //         id: parseInt(productId)
        //     }
        // })

        await prisma.products.update({
            where: {
                id: parseInt(productId)
            },

            data: {
                isDeleted: 1,
                deletedAt: new Date(),
                deletedBy: req.user.id
            }
        })

        return true;
    }
}