import { Request, Response } from "express";
import ProfileModel from "../models/profile.model";
import UserModel from "../models/user.model";
import { IProfile } from "../models/profile.model";
import { IUser } from "../models/user.model";
import cloudinary from 'cloudinary';

interface AuthenticatedRequest extends Request {
    user?: { userId: string };
}

export const createOrUpdateProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        const { bio, social, backgroundImage } = req.body;
        const { userId } = req.user as { userId: string };

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        let profile = await ProfileModel.findOne({ user: userId });

        if (profile) {
            profile.bio = bio || profile.bio;
            profile.social = social || profile.social;
            profile.backgroundImage = backgroundImage || profile.backgroundImage;
            await profile.save();

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                profile,
            });
        } else {
            profile = new ProfileModel({
                user: userId,
                bio,
                social,
                backgroundImage,
            });
            await profile.save();

            return res.status(201).json({
                success: true,
                message: "Profile created successfully",
                profile,
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        });
    }
};

export const getProfileData = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userName } = req.params;
        const profile = await ProfileModel.findOne({ userName: userName }).populate('user').exec();
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Profile found",
            profile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        });
    }
};



