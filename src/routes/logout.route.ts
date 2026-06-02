import { Router } from "express"
import { logout } from "../controllers/logout.controller"
import AuthMiddleware from "../middleware/auth.middleware"

const logoutRouter = Router()
logoutRouter.post("/", AuthMiddleware, logout)
export default logoutRouter