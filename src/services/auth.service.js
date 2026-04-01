import { BadRequestException, UnauthorizedException } from "../common/helpers/exception.helper.js";
import { prisma } from "../common/prisma/connect.prisma.js";
import bcrypt from "bcrypt";
import { tokenService } from "./token.service.js";

export const authService = {
   async login(req) {
    const { username, password } = req.body;

    const userExists = await prisma.admins.findUnique({
        where: {
            username: username
        },
        omit: {
            password: false
        }
    })

    if (!userExists) throw new BadRequestException("User do not exist");

    const isPassword = bcrypt.compareSync(password, userExists.password);
    if (!isPassword){
        throw new BadRequestException("Mật khẩu không chính xác")
    }

    const accessToken = tokenService.createAccessToken(userExists.id);
    const refreshToken = tokenService.createRefreshToken(userExists.id);

    console.log({ username, password, userExists, isPassword })

    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };

   },

   async register(req) {
    const { username, password, fullName } = req.body;
    const userExists = await prisma.admins.findFirst({
        where: {
            username: username,
        }
    })

    if (userExists) throw new BadRequestException("Người dùng đã tạo tài khoản");

    const hashPassword = bcrypt.hashSync(password, 10);

    const newUser = await prisma.admins.create({
        data: {
            username: username,
            password: hashPassword,
            fullName: fullName
        }
    })
    console.log({ username, hashPassword, fullName, userExists });

    return true;
   },

   async getInfo(req){
    const user = req.user;
    return req.user;
   }, 

   async logout(req){
    const user = req.user;
    
    if (!user) {
        throw new UnauthorizedException("User not authenticated");
    }

    // Xác minh người dùng tồn tại trong database
    const userExists = await prisma.admins.findUnique({
        where: {
            id: user.id
        }
    });

    if (!userExists) {
        throw new BadRequestException("User does not exist");
    }

    console.log({ userId: user.id });
    return true;
   },

   async refreshToken(req){
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken) {
        throw new UnauthorizedException("No Access Token")
    }

    if (!refreshToken){
        throw new UnauthorizedException("No Refresh Token")
    }

    
    const decodeAccessToken = tokenService.verifyAccessToken(accessToken, { ignoreExpiration: true });
    const decodeRefreshToken = tokenService.verifyRefreshToken(refreshToken);

    if (decodeAccessToken.userId !== decodeRefreshToken.userId){
        throw new UnauthorizedException("Invalid Token")
    }


    const userExists = await prisma.admins.findUnique({
        where: {
            id: decodeAccessToken.userId
        }
    });

    const newAccessToken = tokenService.createAccessToken(userExists.id);
    const newRefreshToken = tokenService.createRefreshToken(userExists.id);




    console.log({ accessToken, refreshToken, decodeAccessToken, decodeRefreshToken })
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
   }
};