import mongoose from "mongoose";

const DB_URL = process.env.DB_URL || "";

export const dbConnect = () => {
    return mongoose.connect(DB_URL).
        then(() => {
            console.log(`Database connected successfully at : ${mongoose.connection.host}`);
        }).catch((error: string) => {
            console.log('Database connection failed');
            console.log(error);
            process.exit(1);
        });
}

