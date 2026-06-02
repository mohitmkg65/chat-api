import { SessionInterface } from "../middleware/auth.middleware"
import { CatchError, TryError } from "../utils/error"
import { Response } from "express"
import { Types } from "mongoose"
import MessageModel from "../models/message.model"
import UserModel from "../models/user.model"
import ChatModel from "../models/chat.model"

export const createChat = async (request: SessionInterface, response: Response) => {
    try {
        const initiatorId = request.session?.id
        const {participants, isGroup, groupName} = request.body
        const allParticipantsSet = new Set([initiatorId, ...participants])
        const allParticipants = Array.from(allParticipantsSet).map((id) => new Types.ObjectId(id))
        
        const validUsersCount = await UserModel.countDocuments({ _id: { $in: allParticipants } })
        if (validUsersCount !== allParticipants.length)
            throw TryError("One or more chat participant user IDs do not exist.", 404)

        console.log("Participants from Request Body:", allParticipants)

        if (!isGroup) {
            if (allParticipants.length !== 2)
                throw TryError("A direct message room is limited to exactly two participants.", 400)

            const existingChat = await ChatModel.findOne({
                isGroup: false,
                participants: { $all: allParticipants, $size: 2 },
            })
            // .populate("participants", "name email status lastSeen")

            if (existingChat)
                return response.status(200).json({ success: true,  message: "Chat room created successfully.", data: existingChat })
        }

        const newChat = new ChatModel({
            participants: allParticipants,
            isGroup,
            groupName: isGroup ? (groupName || "New Group Chat") : undefined,
        })
        await newChat.save()        
        const chatWithParticipants = await ChatModel.findById(newChat._id)
        // .populate("participants", "name email status")
        return response.status(200).json({ success: true, message: "Chat room created successfully.", data: newChat })
    } catch (error) {
        CatchError(error, response, 'Failed to fetch freinds')
    }
}

export const fetchChat = async (request: SessionInterface, response: Response) => {
    try {
        if(!request.session)
            throw TryError("Failed to fetch chats")

        const chats = await ChatModel.find({ participants: request.session.id }).sort({ updatedAt: -1 }).lean()
        // .populate("participants", "name email status lastSeen")
        response.json({ chats })
    } catch (error) {
        CatchError(error, response, 'Failed to fetch chats')
    }
}

export const createMessage = async (request: SessionInterface, response: Response) => {
    try {
        const { chatId, message, fileUrl } = request.body
        const senderObjId = new Types.ObjectId(request.session!.id)
        const chatObjId = new Types.ObjectId(chatId)

        const chatExists = await ChatModel.exists({ _id: chatObjId })
        if (!chatExists) 
            throw TryError("Specified chat room not found.", 404)

        const newMessage = new MessageModel({
            chatId: chatObjId,
            senderId: senderObjId,
            message: message,
            fileUrl,
        })
        await newMessage.save()

        await ChatModel.updateOne({ _id: chatObjId }, { $set: { updatedAt: new Date() } })
        const messageWithSender = await MessageModel.findById(newMessage._id)
        // .populate("senderId", "name email status")
        response.json({ success: true, message: "Message sent successfully.", data: messageWithSender })
    } catch (error) {
        CatchError(error, response, 'Failed to send message')
    }
}

export const fetchMessage = async (request: SessionInterface, response: Response) => {
    try {
        const { chatId } = request.params
        if (!chatId || Array.isArray(chatId))
            throw TryError("Invalid Chat ID.", 400)

        const limit = parseInt(request.query.limit as string || "30", 10)
        const page = parseInt(request.query.page as string || "1", 10)
        const skip = (page - 1) * limit 
        
        const chatObjId = new Types.ObjectId(chatId)
        const chatExists = await ChatModel.exists({ _id: chatObjId })
        if (!chatExists) 
            throw TryError("Specified chat room not found.", 404)

        const messages = await MessageModel.find({ chatId: chatObjId }).sort({ createdAt: -1 }).skip(skip).limit(limit)
        // .populate("senderId", "name email status").lean()
        const data = messages.reverse()
        
        const total = await MessageModel.countDocuments({ chatId: chatObjId })
        const pagination = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }

        response.json({ success: true, data, pagination })
    } catch (error) {
        CatchError(error, response, 'Failed to fetch messages')
    }   
}

// export const fetchFreinds = async (request: SessionInterface, response: Response) => {
//     try {
//         const freinds = await UserModel.find({_id: {$ne: request.session?.id}}, {password: 0})
//         response.json(freinds)
//     } catch (error) {
//         CatchError(error, response, 'Failed to fetch freinds')
//     }
// }

// export const fetchChat = async (req:SessionInterface, res:Response) => {
//     try {
//         if(!req.session)
//             throw TryError("Failed to fetch chats")

//         // const chats = await ChatModel.find({
//         //     $or: [
//         //         {from: req.session.id, to: req.params.to},
//         //         {from: req.params.to, to: req.session.id}
//         //     ]
//         // }).populate("from", "fullname email mobile").lean()

//         // const modifiedChats = await Promise.all(
//         //     chats.map(async (item) => {
//         //         if(item.file){
//         //             return {
//         //                 ...item,
//         //                 file: {
//         //                     path: item.file.path && await downloadObject(item.file.path),
//         //                     type: item.file.type
//         //                 }
//         //             }
//         //         }
//         //         return item
//         //     })
//         // )

//         // res.json({chats: modifiedChats})
//     } catch (error) {
//         CatchError(error, res, "Failed to fetch chats")
//     }
// }