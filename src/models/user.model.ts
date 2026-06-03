import { Schema, model, Types } from "mongoose";
import bcrypt from 'bcrypt'
import { userInterface } from "../utils/types";

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
    },
    status: {
        type: String,
        enum: [],
        default: "active",
        required: [true, "Status is required"],
    },
}, {timestamps: true})

userSchema.pre('save', async function(){
    this.password = await bcrypt.hash(this.password.toString(), 12)
})

const UserModel = model<userInterface>('User', userSchema)
export default UserModel