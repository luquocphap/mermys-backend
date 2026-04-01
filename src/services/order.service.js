import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";
import { validator } from "../common/helpers/validator.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const orderService = {
    async create(req) {
        const data = req.body;
        
        // 1. Validate cơ bản
        if (!validator.isEmail(data.email)) throw new BadRequestException("Email không hợp lệ");
        if (!validator.isVNPhone10(data.phone)) throw new BadRequestException("Số điện thoại không hợp lệ");
        if (!validator.isAddress(data.address)) throw new BadRequestException("Địa chỉ không hợp lệ");
        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            throw new BadRequestException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }

        // 2. Tạo Order và các Paid Products cùng một lúc bằng Nested Writes
        const newOrder = await prisma.order.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                city: data.city,
                ward: data.ward,
                address: data.address,
                note: data.note,
                paid_products: {
                    create: data.items.map(item => ({
                        product_quantity_id: item.product_quantity_id,
                        amount: item.amount
                    }))
                }
            }
        });
        
        return {
            id: newOrder.id
        };
    },

    async findAll(req) {
        const { index, page, pageSize, where } = buildQueryPrisma(req)

        // 3. Lấy Order kèm theo danh sách paid_products bên trong
        const resultPrismaPromise = prisma.order.findMany({
            where: where,
            include: {
                paid_products: {
                    include: {
                        product_quantities: {
                            select: {
                                price: true,
                                products: {
                                    select: {
                                        name: true,
                                        image_link: true
                                    }
                                },
                                quantities: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            skip: index,
            take: pageSize,
            orderBy: { createdAt: 'desc' }
        });

        const totalItemsPromise = prisma.order.count({
            where: where
        });
        
        const [resultPrisma, totalItems] = await Promise.all([resultPrismaPromise, totalItemsPromise]);
        const totalPage = Math.ceil(totalItems / pageSize);
        
        return {
            totalItem: totalItems,
            totalPage: totalPage,
            page: page,
            items: resultPrisma
        };        
    },

    async findOne(req) {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: {
                id: Number(id),
                isDeleted: 0
            },
            include: {
                paid_products: {
                    include: {
                        product_quantities: {
                            include: {
                                products: true,
                                quantities: true
                            }
                        }
                    }
                }
            }
        });
        return { order };
    },

    async remove(req) {
        const { id } = req.params;
        
        const deletedOrder = await prisma.order.update({
            where: {
                id: Number(id)
            },
            data: {
                isDeleted: 1,
                deletedBy: req.user.id,
                deletedAt: new Date()
            }
        });
        return {
            deletedOrder: deletedOrder
        };
    }
};