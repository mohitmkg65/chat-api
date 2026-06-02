import { createChat, createMessage, fetchChat, fetchMessage } from "../controllers/chat.controller"
import AuthMiddleware from "../middleware/auth.middleware"
import { Router } from "express"

const chatRouter = Router()
chatRouter.post("/", AuthMiddleware, createChat);
chatRouter.get("/", AuthMiddleware, fetchChat);
chatRouter.post("/message", AuthMiddleware, createMessage);
chatRouter.get("/message/:chatId", AuthMiddleware, fetchMessage);
export default chatRouter