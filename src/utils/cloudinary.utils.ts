import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY,
});

export const uploadProfilePhoto = async (imageBuffer: Buffer, userId: string) => {
    try {
        return new Promise<string>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'profile_photos', public_id: userId },
                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result?.secure_url || '');
                }
            );
            stream.end(imageBuffer);
        });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw error;
    }
};
