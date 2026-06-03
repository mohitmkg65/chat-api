import { Schema, model, Types } from "mongoose"
import { chatInterface } from "../utils/types"
import mongoose from "mongoose";

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

// ChatSchema.index({ participants: 1 })
// const chatSchema = new mongoose.Schema({
//     participants: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User"
//     }]
// });

const ChatModel = model<chatInterface>("Chat", ChatSchema)
export default ChatModel
