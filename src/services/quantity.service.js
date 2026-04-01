import { prisma } from "../common/prisma/connect.prisma.js";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";
export const quantityService = {
   async create(req) {
      return `This action create`;
   },

   async findAll(req) {
      const { index, page, pageSize, where } = buildQueryPrisma(req);

        // const resultSequelize = await product.findAll();
        const resultPrismaPromise = prisma.quantities.findMany({
            where: where,
            skip: index,
            take: pageSize
        });

        const totalItemsPromise = prisma.quantities.count({
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
      const quantity = await prisma.quantities.findUnique({
         where: {
            id: Number(id)
         }
      });


      return {
         quantity: quantity
      };
   },

   async update(req) {
      return `This action updates a id: ${req.params.id} quantity`;
   },

   async remove(req) {
      return `This action removes a id: ${req.params.id} quantity`;
   }
};