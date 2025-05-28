import { Request, Response, NextFunction } from "express";
import User from "../models/userSchema";
import Jwt from "../utils/jwt";
import bcryptjs from "bcryptjs";
import { Model } from "mongoose";
import { UserType } from "../types/interface/IUser";
import MessageBroker from "../utils/messageBroker";
import { UserEvent } from "../types/kafkaTypes";
import { AuthRequest } from "../types/api";
import { OAuth2Client } from "google-auth-library";
import admin from "./firebase";


class UserController {
  private Jwt: Jwt;
  private UserModel: Model<UserType>;
  private Kafka: MessageBroker;
  private clientGG: any;


  constructor() {
    this.Jwt = new Jwt();
    this.clientGG = new OAuth2Client({
      clientId: "832965783331-p7p2umgmuelgn6edi23imh4n144frc4f.apps.googleusercontent.com",
    });
    this.UserModel = User;
    this.Kafka = new MessageBroker();
  }

  async registerUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { name, email, password, role = "user", avatar } = req.body;

      const exist = await this.UserModel.findOne({ email });
      
      if (exist) {
        return res.status(400).json({ success: false, message: "Người dùng đã tồn tại" });
      }

      const hashPassword = await bcryptjs.hash(password, 10);
      const newUser = new this.UserModel({ name, email, password: hashPassword, role, avatar });

      await newUser.save();

      await this.Kafka.publish("User-Topic", { data: newUser }, UserEvent.CREATE);

      res.status(201).json({
        success: true,
        message: "Tạo người dùng thành công",
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      res
        .clearCookie("accessToken", {
          httpOnly: true,
          sameSite: "strict",
        })
        .clearCookie("refreshToken", {
          httpOnly: true,
          sameSite: "strict",
        })
        .status(200)
        .json({
          success: true,
          message: "Đăng xuất thành công",
        });
    } catch (error) {
      next(error);
    }
  }
  

  async login(req: Request, res: Response, next: NextFunction) : Promise<any> {
    try {
      const { email, password } = req.body;
      const user = await this.UserModel.findOne({ email });

      if (!user) {
        return res.status(400).json({ success: false, message: "Người dùng không tồn tại" });
      }

      const validPassword = await bcryptjs.compare(String(password), user.password);
      if (!validPassword) {
        return res.status(400).json({ success: false, message: "Password không chính xác" });
      }

      const {accessToken, refreshToken  } = this.Jwt.generateToken(user);

      const { password: _, ...record } = user.toObject();

      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({
          success: true,
          message: "Đăng nhập thành công",
          data: record,
        });
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: "Thiếu trường id" });
      }

      const user = await this.UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
      }
      
      const { password: _, ...record } = user.toObject();

      res.status(200).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) :Promise<any> {
    try {
      const data = req.body;
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ success: false, message: "Không có dữ liệu để cập nhật" });
      }

      const userId = req.user?.id || req.user?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Không xác thực được người dùng" });
      }

      const user = await this.UserModel.findByIdAndUpdate(userId, data, { new: true });
      if (!user) {
        return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
      }

      await this.Kafka.publish("User-Topic", { data: user }, UserEvent.UPDATE);
      const { password: _, ...record } = user.toObject();

      res.status(200).json({
        success: true,
        message: "Cập nhật người dùng thành công",
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const limit = Number(req.query.limit) || 10;
      const users = await this.UserModel.find().limit(limit);

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async loginWithGoogle(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { idToken } = req.body;
  
      // Verify idToken với Google
      // const ticket = await this.clientGG.verifyIdToken({
      //   idToken,
      //   audience: "832965783331-p7p2umgmuelgn6edi23imh4n144frc4f.apps.googleusercontent.com"
      // });

      const decoded = await admin.auth().verifyIdToken(idToken);

  
      const { uid, email, name, picture } = decoded;
   
      let user = await this.UserModel.findOne({ email });

      if (!user) {
        user = await this.UserModel.create({
          name,
          email,
          password:await bcryptjs.hash(uid, 10),
          role: "user",
          avatar: picture
        });
      }
  
      const {accessToken, refreshToken  } = this.Jwt.generateToken(user);

  
      res.status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        })
      .json({
        message: "Đăng nhập thành công",
        data: user
      });
    } catch (err) {
      res.status(401).json({ success: false, message: "Xác thực Google thất bại" });
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) :Promise<any> {
    try {
      const token = req.cookies.refreshToken;
      
      if (!token) {
        return res.status(401).json({ success: false, message: "Thiếu refresh token" });
      }
  
      const {payload} : any = await this.Jwt.verifyToken(token);
      
      if(!payload || !payload.user) {
        return res.status(401).json({ success: false, message: "Token không chính xác. Vui lòng đăng nhập lại" });
      }
      const userCurrent = await this.UserModel.findById(payload.user.id);
      
      if (!userCurrent) {
        return res.status(401).json({ success: false, message: "Người dùng không tồn tại" });
      }
      const {accessToken, refreshToken  } = this.Jwt.generateToken(userCurrent);

      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({
          success: true,
          message: "Refresh Token thành công",
          data: userCurrent,
        });

    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return res.status(403).json({ success: false, message: "Refresh token đã hết hạn" });
      }
  
      return res.status(401).json({ success: false, message: "Refresh token không hợp lệ" });
    }
  }
}

export default UserController;
