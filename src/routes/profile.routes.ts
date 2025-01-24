import express from "express";
import multer from "multer";
import { createOrUpdateProfile, getProfileData } from "../controllers/profile.controllers";
import { userMiddleware } from "../middlewares/auth.middlewares";
import { updateProfile, updateSocialLinks, addLink } from "../controllers/updateProfile.controllers";

const storage = multer.memoryStorage();

const upload = multer({ storage }).fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'backgroundPicture', maxCount: 1 }
]);

const Router = express.Router();
Router.post("/createProfile", userMiddleware as any, upload, createOrUpdateProfile as any);
Router.get("/getProfile/:userName", getProfileData as any);
Router.put("/updateProfile", userMiddleware as any, upload, updateProfile as any);
Router.put("/updateSocialLinks", userMiddleware as any, updateSocialLinks as any);
Router.post("/addLink", userMiddleware as any, addLink as any);

export default Router;
