import express from "express";
import UserController from "../controllers/userController";
const userRoute = express.Router();
const userController = new UserController();

userRoute.route('/register').post(userController.registerUser.bind(userController));
userRoute.route('/login').post(userController.login.bind(userController));

export default userRoute;