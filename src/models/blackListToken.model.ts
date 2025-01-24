import mongoose from "mongoose";
import { Document, Schema } from "mongoose";

export interface IBlackListToken extends Document {
    token: string;
}

const blackListTokenSchema: Schema<IBlackListToken> = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

const BlackListTokenModel = mongoose.model<IBlackListToken>("BlackListToken", blackListTokenSchema);
export default BlackListTokenModel;
