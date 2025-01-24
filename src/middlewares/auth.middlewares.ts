import { NextFunction, Request, Response } from "express";
import Jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'MY_SECRET';

interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

export const userMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    console.log('Request headers:');
    const authHeader = req.headers.authorization || req.cookies.token;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "User is Not Authorized!",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = await Jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log('Decoded User:', decoded);
        next();
    } catch (e) {
        return res.status(403).json({
            success: false,
            message: "Invalid or Expired Token!",
        });
    }
};