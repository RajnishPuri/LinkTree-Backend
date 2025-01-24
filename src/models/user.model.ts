import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    userName: string;
    profilePhoto: string;
    Profile: mongoose.Schema.Types.ObjectId;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    Profile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userName: 1 }, { unique: true });


const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;
