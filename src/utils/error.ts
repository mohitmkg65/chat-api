import { Response } from "express"

interface ErrorMessage extends Error {
    status?: number
}

export const TryError = (message:string, status:number = 500) => {
    const error: ErrorMessage = Error(message)
    error.status = status
    return  error
}

export const CatchError = (error: unknown, res: Response, prodMessage: string = "Internal server error") => {
    if(error instanceof Error){
        const message = error.message
        const status = (error as ErrorMessage).status || 500
        res.status(status).json({message})
    }
}