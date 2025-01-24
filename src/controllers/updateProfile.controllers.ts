import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import ProfileModel from '../models/profile.model';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
    };
    files?: {
        [fieldname: string]: Express.Multer.File[];
    };
}

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY,
});

const uploadFileToCloudinary = async (
    fileBuffer: Buffer,
    folder: string,
    publicId?: string
): Promise<string> => {
    try {
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: publicId,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Error uploading file to Cloudinary:', error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            uploadStream.end(fileBuffer);
        });

        return result.secure_url;
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
        throw new Error('Failed to upload file');
    }
};

export const updateProfile = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<Response> => {
    try {
        console.log('Request body:', req.body);
        const { name, email, userName, bio } = req.body;
        const files = req.files;

        if (!name || !email || !userName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the required fields',
            });
        }

        const user = await UserModel.findById(req.user?.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        user.name = name;
        user.email = email;
        user.userName = userName;

        if (!user._id) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        if (files?.profilePicture?.[0]) {
            const profilePicUrl = await uploadFileToCloudinary(
                files.profilePicture[0].buffer,
                'profile_photos',
                user._id.toString()
            );
            user.profilePhoto = profilePicUrl;
        }

        const userProfile = await ProfileModel.findOne({ user: req.user?.userId });
        console.log('User Profile:', userProfile);
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        if (bio !== undefined) {
            userProfile.bio = bio;
        }

        if (files?.backgroundPicture?.[0]) {
            const backgroundPicUrl = await uploadFileToCloudinary(
                files.backgroundPicture[0].buffer,
                'background_photos',
                `${user._id}-background`
            );
            userProfile.backgroundImage = backgroundPicUrl;
        }

        userProfile.userName = userName;

        await user.save();
        await userProfile.save();

        const updatedDetail = await ProfileModel.findOne({ user: req.user?.userId })
            .populate('user')
            .exec();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            updatedDetail,
        });
    } catch (error) {
        console.error(error);

        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: errorMessage,
        });
    }
};

export const updateSocialLinks = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { social } = req.body;

        const user = await UserModel.findById(req.user?.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const userProfile = await ProfileModel.findOne({ user: req.user?.userId });

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        userProfile.social = social;

        await userProfile.save();

        const updatedDetail = await ProfileModel.findOne({ user: req.user?.userId })
            .populate('user')
            .exec();

        return res.status(200).json({
            success: true,
            message: 'Social links updated successfully',
            updatedDetail
        });
    } catch (error) {
        console.error(error);

        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: errorMessage,
        });
    }
};

export const addLink = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
        const { handleName, description, link } = req.body;

        if (!handleName || !description || !link) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all the required fields',
            });
        }

        const userProfile = await ProfileModel.findOne({ user: req.user?.userId });

        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
            });
        }

        const duplicate = userProfile.social.find(
            (social) => social.handleName === handleName
        );
        if (duplicate) {
            return res.status(400).json({
                success: false,
                message: `Social handle "${handleName}" already exists for this user.`,
            });
        }

        userProfile.social.push({ handleName, description, link });
        await userProfile.save();

        const updatedDetail = await ProfileModel.findOne({ user: req.user?.userId })
            .populate('user')
            .exec();

        return res.status(200).json({
            success: true,
            message: 'Link added successfully',
            updatedDetail,
        });
    } catch (error) {
        console.error(`Error in addLink:`, error);

        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: errorMessage,
        });
    }
};
