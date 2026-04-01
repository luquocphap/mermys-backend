import { statusCodes } from "./status-code.helper.js"

export class BadRequestException extends Error {
    code = statusCodes.BAD_REQUEST
    name = "BadRequestException"
    constructor(message = "BadRequestException") {
        super(message)
    }
}

// 401
export class UnauthorizedException extends Error {
    code = statusCodes.UNAUTHORIZED
    name = "UnauthorizedException"
    constructor(message = "UnauthorizedException") {
        super(message)
    }
}

// 403 Khi gặp thì gọi api refresh-token
export class ForBiddenException extends Error {
    code = statusCodes.FORBIDDEN
    name = "ForBiddenException"
    constructor(message = "ForBiddenException") {
        super(message)
    }
}

// 404 
export class NotFoundException extends Error {
    code = statusCodes.NOT_FOUND
    name = "NotFoundException"
    constructor(message = "NotFoundException") {
        super(message)
    }
}



