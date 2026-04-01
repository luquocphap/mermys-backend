import jwt from "jsonwebtoken"
import { BadRequestException } from "../common/helpers/exception.helper.js"
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../common/constant/app.constant.js"

export const tokenService = {
    createAccessToken(userid) {
        if (!userid){
            throw new BadRequestException("Unknown Userid to create token")
        }

        const accessToken = jwt.sign({ userId: userid }, ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
        return accessToken;
    },

    createRefreshToken(userid) {
        if (!userid){
            throw new BadRequestException("Unknown Userid to create token")
        }

        const refreshToken = jwt.sign({ userId: userid }, REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
        return refreshToken;
    },

    verifyAccessToken(accessToken, option){
        const decode = jwt.verify(accessToken, ACCESS_TOKEN_SECRET, option);
        return decode
    },

    verifyRefreshToken(refreshToken, option){
        const decode = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, option);
        return decode
    }
}