import { PayloadInterface } from "../middleware/auth.middleware"
import { Request, Response } from "express"
import { CatchError, TryError } from "../utils/error"
import UserModel from "../models/user.model"
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"

const accessTokenExpiry = '2h'
const twoHoursInMs = (2*60*60)*1000

const generateToken = (payload: PayloadInterface) => {
    const accessToken = jwt.sign(payload, process.env.AUTH_SECRET!, {expiresIn: accessTokenExpiry})
    return accessToken
}

const getOptions = () => {
    return {
        httpOnly: true,
        maxAge: twoHoursInMs,
        secure: false,
        domain: 'localhost'
    }
}

export const signup = async (request: Request, response: Response) => {
    try {
        await UserModel.create(request.body)
        response.json({message: "Signup success"})
    } catch (error: unknown) {
        CatchError(error, response)
    }
}

export const login = async(request: Request, response: Response) => {
    try {
        const {email, password} = request.body
        const user = await UserModel.findOne({email})
        if(!user)
            throw TryError("User not found, please try to signup first", 404)

        const isLogin = await bcrypt.compare(password, user.password)
        if(!isLogin)
            throw TryError("Invalid credentials email or password incorrect", 401)

        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            status: user.status,
        }
        const accessToken = generateToken(payload)

        response.cookie("accessToken", accessToken, getOptions())
        response.json({message: "Login success"})
    } catch (error: unknown) {
        CatchError(error, response)
    }
}