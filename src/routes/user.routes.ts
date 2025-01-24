import express from "express";
import { createUser, loginUser, logoutUser } from "../controllers/user.controllers";
import { Response } from "express";

const Router = express.Router();

Router.post("/createUser", createUser as any);
Router.post("/userLogin", loginUser as any);
Router.post("/logout", logoutUser as any);

export default Router;