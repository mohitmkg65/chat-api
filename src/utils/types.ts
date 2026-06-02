import { Types } from "mongoose";

export interface userInterface extends Document {
    _id: Types.ObjectId
    name: string;
    email: string;
    password: string;
    status: string;
    createdAt: Date
    updatedAt: Date
}

export interface chatInterface extends Document {
    _id: Types.ObjectId
    participants: Types.ObjectId[]
    isGroup: boolean
    groupName?: string
    createdAt: Date
    updatedAt: Date
}

export interface messageInterface extends Document {
    _id: Types.ObjectId;
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    message: string;
    fileUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}