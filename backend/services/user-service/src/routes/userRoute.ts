
import express from "express";
import UserController from "../controllers/userController";
import { authMid, autAdminMid } from "../middleware/authMid";

const userRoute = express.Router();
const userController = new UserController();

userRoute.post("/register", userController.registerUser.bind(userController));
userRoute.post("/login", userController.login.bind(userController));

userRoute.get("/:id", authMid, userController.get.bind(userController)); 
userRoute.put("/:id", authMid, userController.update.bind(userController)); 
userRoute.post("/refreshToken", userController.refreshToken.bind(userController)); 
userRoute.post("/login-email", userController.loginWithGoogle.bind(userController)); 
userRoute.post("/logout", userController.logout.bind(userController)); 


userRoute.get("/", authMid, autAdminMid, userController.getAll.bind(userController))

export default userRoute;
