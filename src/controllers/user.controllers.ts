import { IUser } from "../models/user.model";
import UserModel from "../models/user.model";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import BlackListTokenModel from "../models/blackListToken.model";
import { IBlackListToken } from "../models/blackListToken.model";
import { createProfilePhoto } from '../utils/createDefaultPhoto.utils';
import { uploadProfilePhoto } from '../utils/cloudinary.utils';
import ProfileModel from "../models/profile.model";

interface UserCredentials extends Request {
    email: string;
    password: string;
}

export const createUser = async (req: UserCredentials, res: Response): Promise<Response> => {
    try {
        const user: IUser = req.body;
        if (!user.name || !user.email || !user.password || !user.userName) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        console.log(user);
        const existingUser = await UserModel.findOne({ email: user.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const photoBuffer = await createProfilePhoto(user.name);

        const photoUrl = await uploadProfilePhoto(photoBuffer, user.email);

        const hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;

        user.profilePhoto = photoUrl;

        const newUser = new UserModel(user);
        await newUser.save();

        await ProfileModel.create({ user: newUser._id, userName: newUser.userName });

        const profileId = await ProfileModel.findOne({ user: newUser._id });
        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: "Profile not created"
            });
        }

        const prevUser = await UserModel.findByIdAndUpdate(newUser._id, { Profile: profileId._id }, { new: true });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            prevUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        });
    }
}

export const loginUser = async (req: UserCredentials, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body as UserCredentials;
        const user = await UserModel.findOne({ email }).select('+password').populate('Profile').exec();
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }
        const token = jwt.sign({ userId: user._id, userName: user.userName }, process.env.JWT_SECRET || "", { expiresIn: "1h" });
        res.setHeader("Authorization", `Bearer ${token}`);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        const userWithProfile = await UserModel.findById(user._id).populate('Profile').exec();

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            user: userWithProfile
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error
        });
    }
};

export const logoutUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token not found",
            });
        }
        const blackListToken: IBlackListToken = new BlackListTokenModel({ token });
        await blackListToken.save();
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};


