import { prisma } from "../common/prisma/connect.prisma.js";
import { buildQueryPrisma } from "../common/helpers/build-query-prisma.helper.js";
import { validator } from "../common/helpers/validator.helper.js";
import { BadRequestException } from "../common/helpers/exception.helper.js";
import { SMTP_USER } from "../common/constant/app.constant.js";
import { transporter } from "../common/email/init.nodemailer.js";
import nodemailer from "nodemailer";
import { getConfirmationTemplate } from "../common/constant/email.constant.js";
export const emailService = {
    async create(req) {
        const data = req.body;
        if (!validator.isEmail(data.email)) throw new BadRequestException("Email Không Hợp Lệ");
        if (data.phone !== undefined && !validator.isVNPhone10(data.phone)) throw new BadRequestException("Số điện thoại không hợp lệ")
        const newMessage = await prisma.messages.create({
            data: data
        })

        await this.contactEmail(data);
        return {
            newMessage: newMessage
        };
    },

    async findAll(req) {
        const { index, page, pageSize, where } = buildQueryPrisma(req)

        // const resultSequelize = await product.findAll();
        const resultPrismaPromise = prisma.messages.findMany({
            where: where,
            skip: index,
            take: pageSize
        });

        const totalItemsPromise = prisma.messages.count({
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
        const email = await prisma.messages.findUnique({
            where: {
                id: Number(id),
                isDeleted: 0
            }
        });
        return {
            email: email
        };
    },

    async remove(req) {
        const { id } = req.params;
        const newEmail = await prisma.messages.update({
            where: {
                id: Number(id)
            },
            data: {
                isDeleted: 1,
                deletedBy: req.user.id,
                deletedAt: new Date()
            }
        })
        return newEmail;
    },

    async contactEmail(contactData){
        const html = getConfirmationTemplate(contactData);

        await transporter.sendMail({
            from: '"Memys" <memysvietnam@gmail.com>',
            to: contactData.email,
            subject: 'MEMYS – CẢM ƠN BẠN ĐÃ GHÉ THĂM 🌿',
            html: html,
        });

    }
};