import { Response } from "express"
import { SessionInterface } from "../middleware/auth.middleware"
import { getOptions } from "./auth.controller"
import { CatchError } from "../utils/error"

export const logout = (request: SessionInterface, response: Response) => {
    try {
        response.clearCookie("accessToken", getOptions(0))
        response.send({message: "Logout success"})
    } catch (error) {
        CatchError(error, response, "Failed to logout")
    }
}