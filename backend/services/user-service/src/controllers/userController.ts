import { Request, Response, NextFunction } from "express";
import User from "../models/userSchema";
import Jwt from "../utils/jwt";
import bcryptjs from "bcryptjs";
import { Model } from "mongoose";
import { UserType } from "../types/interface/IUser";
import MessageBroker from "../utils/messageBroker";
import { UserEvent } from "../types/kafkaTypes";
import { AuthRequest } from "../types/api";

class UserController {
  private Jwt: Jwt;
  private UserModel: Model<UserType>;
  private Kafka: MessageBroker;

  constructor() {
    this.Jwt = new Jwt();
    this.UserModel = User;
    this.Kafka = new MessageBroker();
  }

  async registerUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { name, email, password, role = "user" } = req.body;

      const exist = await this.UserModel.findOne({ email });
      if (exist) {
        return res.status(400).json({ success: false, message: "Người dùng đã tồn tại" });
      }

      const hashPassword = await bcryptjs.hash(password, 10);
      const newUser = new this.UserModel({ name, email, password: hashPassword, role });

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

      const token = this.Jwt.generateToken(user);

      const { password: _, ...record } = user.toObject();

      res
        .status(200)
        .cookie("jwtToken", token, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
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
}

export default UserController;
