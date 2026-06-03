import { Server, Socket } from "socket.io"
import UserModel from "../models/user.model"
import ChatModel from "../models/chat.model"
import { populatedMessage } from "../utils/types";
import { createMessageService } from "../controllers/chat.controller"

const activeUsers = new Map<string, Set<string>>()

export function socketHandler(io: Server): void {
    io.on("connection", async (socket: Socket) => {
        const userId = socket.data?.userId
        const userEmail = socket.data?.userEmail

        if (!userId) {
            socket.disconnect(true)
            return
        }

        console.log(`Socket client connected: User ID ${userId}, Email: ${userEmail}, Socket: ${socket.id}`)

        const personalRoom = `user:${userId}`
        socket.join(personalRoom)

        if (!activeUsers.has(userId))
            activeUsers.set(userId, new Set())
        activeUsers.get(userId)!.add(socket.id)

        try {
            const dbUser = await UserModel.findById(userId)
            if (dbUser) {
                dbUser.status = "online"
                await dbUser.save()

                io.emit("user:status_change", {
                    userId,
                    status: "online",
                })
            }
        } catch (err) {
            console.error("Error setting user online on connection:", err)
        }

        socket.on("join", (data: { userId: string }) => {
            const targetRoom = `user:${data.userId}`
            console.log(`Socket ${socket.id} joined channel ${targetRoom}`)
            socket.join(targetRoom)
        })

        socket.on("chat:join", (data: { chatId: string }) => {
            const roomName = `chat:${data.chatId}`
            socket.join(roomName)
            console.log(`Socket ${socket.id} joined chat session: ${roomName}`)
        })

        socket.on("leave", (data: { userId: string }) => {
            const targetRoom = `user:${data.userId}`
            socket.leave(targetRoom)
            console.log(`Socket ${socket.id} left channel ${targetRoom}`)
        })

        socket.on("message:send", async (data: { chatId: string, message: string, fileUrl?: string }) => {
            try {
                const { chatId, message, fileUrl } = data
                if (!chatId || (!message && !fileUrl)) {
                    socket.emit("error", { message: "Invalid message payload structure" })
                    return
                }

                const savedMsg = await createMessageService({ senderId: userId, chatId, message, fileUrl }) as populatedMessage
                if (!savedMsg) {
                    socket.emit("error", { message: "Failed to save message" })
                    return
                }

                const payload = {
                    _id: savedMsg._id.toString(),
                    chatId: savedMsg.chatId.toString(),
                    senderId: savedMsg.senderId._id.toString(),
                    message: savedMsg.message,
                    fileUrl: savedMsg.fileUrl,
                    createdAt: savedMsg.createdAt.toISOString(),
                    sender: {
                        id: savedMsg.senderId._id.toString(),
                        name: savedMsg.senderId.name,
                        email: savedMsg.senderId.email,
                    },
                }

                io.to(`chat:${chatId}`).emit("message:receive", payload)

                const currentChat = await ChatModel.findById(chatId).lean()
                if (currentChat) {
                    for (const participantId of currentChat.participants) {
                        const pIdStr = participantId.toString()
                        io.to(`user:${pIdStr}`).emit("message:receive", payload)
                    }
                }
            } catch (err: any) {
                console.error("Socket error processing message:send:", err.message)
                socket.emit("error", { message: err.message || "Failed to process message transmission" })
            }
        })

        socket.on("typing", async (data: { chatId: string, isTyping: boolean }) => {
            try {
                const { chatId, isTyping } = data
                const dbUser = await UserModel.findById(userId).select("name").lean()
                if (dbUser) {
                    socket.to(`chat:${chatId}`).emit("typing:state", {
                        chatId,
                        userId,
                        userName: dbUser.name,
                        isTyping,
                    })
                }
            } catch (err) {
                console.error("Error broadcasting typing tick:", err)
            }
        })

        socket.on("status", async (data: { status: "online" | "offline" }) => {
            try {
                const { status } = data
                if (status !== "online" && status !== "offline") {
                    socket.emit("error", { message: "Status must be 'online' or 'offline'" })
                    return
                }

                const dbUser = await UserModel.findById(userId)
                if (dbUser) {
                    dbUser.status = status
                    await dbUser.save()

                    io.emit("user:status_change", {
                        userId,
                        status,
                    })
                }
            } catch (err: any) {
                socket.emit("error", { message: err.message || "Failed to alter status" })
            }
        })

        socket.on("disconnect", async () => {
            console.log(`Socket disconnected: ${socket.id} (User: ${userId})`)

            const connections = activeUsers.get(userId)
            if (connections) {
                connections.delete(socket.id)
                if (connections.size === 0) {
                    activeUsers.delete(userId)

                    try {
                        const dbUser = await UserModel.findById(userId)
                        if (dbUser) {
                            dbUser.status = "offline"
                            await dbUser.save()

                            io.emit("user:status_change", {
                                userId,
                                status: "offline",
                            })
                        }
                    } catch (err) {
                        console.error("Error setting user offline on disconnect:", err)
                    }
                }
            }
        })
    })
}
