import { Schema, model, Types } from "mongoose"
import { chatInterface } from "../utils/types"

const ChatSchema = new Schema<chatInterface>({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Participants are required"],
    }],
    isGroup: {
        type: Boolean,
        default: false,
    },
    groupName: {
        type: String,
        trim: true,
    },
},{timestamps: true})

ChatSchema.index({ participants: 1 })

const ChatModel = model<chatInterface>("chats", ChatSchema)
export default ChatModel
