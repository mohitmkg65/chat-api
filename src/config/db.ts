import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose"
export const mongoDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log("MongoDB Connected")
    } catch (error) {
        console.error("DB Error:", error)
        process.exit(1)
    }
}