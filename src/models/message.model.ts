import { Schema, model } from "mongoose"
import { messageInterface } from "../utils/types"

const MessageSchema = new Schema<messageInterface>({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: "Chat",
        required: [true, "chatId is required"],
        index: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "senderId is required"],
        index: true,
    },
    message: {
        type: String,
        required: [true, "Message body cannot be empty"],
        trim: true,
    },
    fileUrl: {
        type: String,
        trim: true,
    },
},{timestamps: true})

MessageSchema.index({ chatId: 1, createdAt: -1 })
MessageSchema.index({ createdAt: -1 })

const MessageModel = model<messageInterface>("messages", MessageSchema)
export default MessageModel
