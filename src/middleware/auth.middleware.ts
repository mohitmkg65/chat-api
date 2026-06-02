import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import mongoose from "mongoose"
import { CatchError, TryError } from "../utils/error"

export interface PayloadInterface {
    id: mongoose.Types.ObjectId
    name: string
    email: string
    status: string
}

export interface SessionInterface extends Request{
    session?: PayloadInterface
}

const AuthMiddleware = async (req: SessionInterface, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies.accessToken
        if(!accessToken)
            throw TryError("Failed to authorise user", 401)

        const payload = await jwt.verify(accessToken, process.env.AUTH_SECRET!) as JwtPayload
        req.session = {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            status: payload.status,
        }
        next()
    } catch (error) {
        CatchError(error, res, "Failed to authorise user")
    }
}

export default AuthMiddleware