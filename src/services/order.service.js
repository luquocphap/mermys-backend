import { or } from "sequelize";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";
import { validator } from "../common/helpers/validator.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
export const orderService = {
    async create(req) {
        const data = req.body;
        if (!validator.isEmail(data.email)) throw new BadRequestException("Email không hợp lệ");
        if (!validator.isVNPhone10(data.phone)) throw new BadRequestException("Số điện thoại không hợp lệ");
        if (!validator.isAddress(data.address)) throw new BadRequestException("Địa chỉ không hợp lệ");

        const newOrder = await prisma.order.create({
            data: data
        });
        return true;
    },

    async findAll(req) {
        const { index, page, pageSize, where } = buildQueryPrisma(req)

        // const resultSequelize = await product.findAll();
        const resultPrismaPromise = prisma.order.findMany({
            where: where,
            skip: index,
            take: pageSize
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
            }
        });
        return {
            order: order
        };
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
        })
        return {
            deletedOrder: deletedOrder
        };
    }
};