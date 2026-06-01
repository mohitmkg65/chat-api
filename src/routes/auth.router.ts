import { login, signup } from "../controllers/auth.controller"
import { Router } from "express"

const authRouter = Router()
authRouter.post("/signup", signup)
authRouter.post("/login", login)
export default authRouter