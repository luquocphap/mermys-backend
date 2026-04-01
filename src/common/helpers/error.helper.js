import { responseError } from "./response.helper.js";
import { statusCodes } from "./status-code.helper.js";
import jwt from "jsonwebtoken"

export const appError = (err, req, res, next) => {
    
    if (err instanceof jwt.JsonWebTokenError){
        err.code = statusCodes.UNAUTHORIZED
    }

    if (err instanceof jwt.TokenExpiredError){
        err.code = statusCodes.FORBIDDEN;
    }
    
    console.log({
        cause: err?.cause,
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        code: err?.code,
    })
    const response = responseError(err?.message, err?.code, err?.stack);
    res.status(err?.code).json(response);
};