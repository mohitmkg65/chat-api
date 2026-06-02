import { mongoDb } from './config/db'
import dotenv from "dotenv"
dotenv.config()
mongoDb()

import cookieParser from 'cookie-parser'
import CorsConfig from "./utils/cors"
import express from "express"
import cors from "cors"

import authRouter from './routes/auth.route'
import chatRouter from './routes/chat.route'
import logoutRouter from './routes/logout.route'

const app = express()
const PORT = Number(process.env.PORT) || 8080

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

app.use(cors(CorsConfig))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/auth', authRouter)
app.use('/api/chat', chatRouter)
app.use('/api/logout', logoutRouter)

export default app