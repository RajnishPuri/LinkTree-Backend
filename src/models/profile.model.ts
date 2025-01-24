import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
    user: mongoose.Schema.Types.ObjectId;
    bio: string;
    social: {
        handleName: string;
        link: string;
        description: string;
    }[];
    backgroundImage: string;
    position: number;
    userName: string;
}

const ProfileSchema: Schema<IProfile> = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    bio: {
        type: String,
    },
    social: [
        {
            handleName: {
                type: String,
                required: true,
                enum: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'Youtube', 'Github', 'Website'],
            },
            link: {
                type: String,
                required: true,
            },
            description: {
                type: String,
            },
        },
    ],
    backgroundImage: {
        type: String,
        default: '',
    },
    userName: {
        type: String,
    },
}, { timestamps: true });


const ProfileModel = mongoose.model<IProfile>('Profile', ProfileSchema);
export default ProfileModel;
