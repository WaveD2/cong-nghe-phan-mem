
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
userRoute.post("/verifyme", authMid, (req : any,res)=>{res.status(200).json({ success: true, user: req.user});})
userRoute.post("/otp", userController.logout.bind(userController));
userRoute.post("/forgot-password/request", userController.requestForgotPasswordOTP.bind(userController)); 
userRoute.post("/forgot-password/confirm", userController.confirmForgotPasswordOTP.bind(userController));
userRoute.post("/forgot-password", userController.forgotPassword.bind(userController));

userRoute.post("/admin-create", authMid, autAdminMid, userController.registerUser.bind(userController));
userRoute.delete("/admin-delete/:id", authMid, autAdminMid, userController.deleteUserByAdmin.bind(userController));
userRoute.post("/forgot-password", userController.forgotPassword.bind(userController));
userRoute.post("/change-password", userController.changePassword.bind(userController));

userRoute.get("/", authMid, autAdminMid, userController.getAll.bind(userController))

export default userRoute;
