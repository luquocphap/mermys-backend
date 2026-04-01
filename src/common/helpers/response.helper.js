import { statusCodes } from "./status-code.helper.js"

export const responseSuccess = (data, message = "OK", statusCode=200) => {
    return {
            status: "success",
            statusCode: statusCodes.OK,
            message: message,
            data: data,
            doc: "swagger.com"
        }
}

export const responseError = (message = "Internal Server Error", statusCode=statusCodes.INTERNAL_SERVER_ERROR, stack) => {
    return {
        status: "error",
        statusCode: statusCode,
        message: message,
        stack: stack,
        doc: "swagger.com"
    }
}