import { getOrderConfirmationTemplate } from "../common/constant/email.constant.js";
import { transporter } from "../common/email/init.nodemailer.js";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";
import { formatCurrency } from "../common/helpers/format.helper.js";
import { validator } from "../common/helpers/validator.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";

export const orderService = {
    async create(req) {
        const { email, phone, address, firstName, lastName, city, ward, note, items, total } = req.body;
        
        if (!validator.isEmail(email)) throw new BadRequestException("Email không hợp lệ");
        if (!validator.isVNPhone10(phone)) throw new BadRequestException("Số điện thoại không hợp lệ");
        if (!validator.isAddress(address)) throw new BadRequestException("Địa chỉ không hợp lệ");
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }

        const newOrder = await prisma.order.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                city: city,
                ward: ward,
                address: address,
                note: note,
                paid_products: {
                    create: items.map(item => ({
                        product_quantity_id: item.product_quantity_id,
                        amount: item.amount
                    }))
                }
            },
        });

        const orderedProducts = await prisma.paid_products.findMany({
            where: {
                order_id: newOrder.id
            },
            include: {
                product_quantities: {
                    include: {
                        quantities: {
                            select: {
                                name: true,
                            }
                        },
                        products: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        })

        const fullName = `${lastName} ${firstName}`;
        const productName = orderedProducts
        .map(cur => `${cur.product_quantities.products.name} (${cur.product_quantities.quantities.name}) x${cur.amount}`)
        .join(', ');        

        await transporter.sendMail({
            from: '"Memys" <memysvietnam@gmail.com>',
            to: email,
            subject: 'XÁC NHẬN ĐƠN HÀNG THÀNH CÔNG TỪ MEMYS',
            html: getOrderConfirmationTemplate({ fullName, email, phone, productName, total: formatCurrency(total) }),
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