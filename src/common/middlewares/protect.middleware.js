import { tokenService } from "../../services/token.service.js";
import { UnauthorizedException } from "../helpers/exception.helper.js";
import { prisma } from "../prisma/connect.prisma.js";

export const protect = async (req, res, next) => {
    const { accessToken } = req.cookies;

    if (!accessToken){
        throw new UnauthorizedException("Not Found Token")
    }

    const decode = tokenService.verifyAccessToken(accessToken)

    const user = await prisma.admins.findUnique({
        where: {
            id: decode.userId,
        }
    });
    req.user = user;

    if (!user) throw new UnauthorizedException("Fail to Authorize")

    // console.log("protect", { accessToken, decode, user })

    next()
}