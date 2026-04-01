import { prisma } from "../common/prisma/connect.prisma.js";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";
export const categoryService = {
    async create(req) {
        const { name } = req.body;
        
        const newCategory = await prisma.categories.create({
            data: {
                name: name
            }
        })
        return true;
    },

    async findAll(req) {
        const { index, page, pageSize, where } = buildQueryPrisma(req)
        
        // const resultSequelize = await product.findAll();
        const resultPrismaPromise = prisma.categories.findMany({
            where: where,
            skip: index,
            take: pageSize
        });

        const totalItemsPromise = prisma.categories.count({
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

    async findOne(req){
        const { id } = req.body;
        const category = await prisma.categories.findUnique({
            where: {
                id: Number(id),
                isDeleted: 0
            }
        });

        return {
            category: category
        }
    },

    async update(req) {
        const { id } = req.params;
        const { name } = req.body;
        const newCategory = await prisma.categories.update({
            where: {
                id: Number(id)
            },
            data: {
                name: name
            }
        });
        return true;
    },

    async remove(req) {
        const { id } = req.params;
        console.log(req.user)
        const newCategory = await prisma.categories.update({
            where: {
                id: Number(id)
            },
            data: {
                isDeleted: 1,
                deletedBy: req.user.id,
                deletedAt: new Date()
            }
        });
        
        return `This action removes a id: ${req.params.id} category`;
    }
};