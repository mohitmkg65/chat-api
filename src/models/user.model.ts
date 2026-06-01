import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

export enum UserStatus {
    active = "Active",
    inActive = "In Active",
}

export interface userInterface extends Document {
    name: string;
    email: string;
    password: string;
    status: string;
}

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: Object.keys(UserStatus),
        default: "active",
        required: true,
    },
}, {timestamps: true})

userSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password.toString(), 12)
})

const UserModel = model<userInterface>('users', userSchema)
export default UserModel