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
import { userLoginValidator, userValidator, userValidatorDefault } from "./validate";
import { z } from "zod";
import { cacheHelper } from "../redis";
import bcrypt from 'bcrypt';
import { helper } from "../utils/heper";
import { sendMailForgotPassword } from "../utils/email";


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
      const validated = userValidator.parse(req.body);

      const exist = await this.UserModel.findOne({ email: validated.email});
      
      if (exist) {
        return res.status(400).json({ success: false, message: "Người dùng đã tồn tại" });
      }

      const hashPassword = await bcryptjs.hash(validated.password, 10);
      validated.password = hashPassword;

      const newUser = new this.UserModel(validated);

      await newUser.save();

      await this.Kafka.publish("User-Topic", { data: newUser }, UserEvent.CREATE);

      const { password: _, ...record } = newUser.toObject();

      res.status(201).json({
        success: true,
        message: "Tạo người dùng thành công",
        data: record,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  }

  async registerByAdmin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const validated = userValidator.parse(req.body);

      const exist = await this.UserModel.findOne({ email: validated.email});
      
      if (exist) {
        return res.status(400).json({ success: false, message: "Người dùng đã tồn tại" });
      }

      const hashPassword = await bcryptjs.hash(validated.password, 10);
      validated.password = hashPassword;

      const newUser = new this.UserModel(validated);

      await newUser.save();

      await this.Kafka.publish("User-Topic", { data: newUser }, UserEvent.CREATE);

      const { password: _, ...record } = newUser.toObject();

      res.status(201).json({
        success: true,
        message: "Tạo người dùng thành công",
        data: record,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  }

  async deleteUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const id = req.params.id;

      const exist = await this.UserModel.findOne({ _id: id});
      
      if (!exist) {
        return res.status(400).json({ success: false, message: "Người dùng không tồn tại" });
      }

      const userDelete = await this.UserModel.findByIdAndDelete(id);

      await this.Kafka.publish("User-Topic", { data: userDelete }, UserEvent.DELETE);

      res.status(200).json({
        success: true,
        message: "Xóa người dùng thành công",
        data: userDelete,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
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
      const result = userLoginValidator.parse(req.body);
      const user = await this.UserModel.findOne({ email: result.email });

      if (!user) {
        return res.status(400).json({ success: false, message: "Người dùng không tồn tại" });
      }

      const validPassword = await bcryptjs.compare(String(result.password), user.password);
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
     
      const validated = userValidatorDefault.parse(req.body);
      const userId = req.params?.id 
      if (!userId) {
        return res.status(401).json({ success: false, message: "Không xác thực được người dùng" });
      }

      const user = await this.UserModel.findByIdAndUpdate(userId, validated, { new: true });
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { limit = 10, page = 1, name, role } = req.query;
  
      const pageSize = Number(limit);
      const currentPage = Number(page);
  
      const filter: any = {};
  
      if (name) {
        filter.name = { $regex: name, $options: 'i' }; // tìm tên không phân biệt hoa thường
      }
  
      const total = await this.UserModel.countDocuments(filter);
      const users = await this.UserModel
        .find(filter)
        .limit(pageSize)
        .skip((currentPage - 1) * pageSize)
        .exec();
  
      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          total,
          totalCurrent: users.length,
          limit: pageSize,
          page: currentPage,
          totalPages: Math.ceil(total / pageSize),
        },
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


  async requestForgotPasswordOTP(req: Request, res: Response) : Promise<any>  {
   try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin Email' });
    }

    const user = await this.UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy nguời dừng' });
    }

    const cacheKey = `forgot-password:${email}`;
    const { code, isSend, ttlPerSeconds } = await helper.requestOTP({
      cacheKey,
      ttlPerSeconds: 5 * 60,
    });

    console.log(`OTP for ${email}: ${code}`);
    if(!isSend) await sendMailForgotPassword(user, String(code));

    return res.status(200).json({
      message: isSend ? `OTP đã được gửi. Vui lồng kiểm tra ${email}` : `OTP gửi thành công qua email ${email}`,
      ttl: ttlPerSeconds,
      success: true,
    });
   } catch (error) {
    console.log("error requestForgotPasswordOTP", error);
    
    return res.status(401).json({ 
      success: false,
      message: 'Lỗi gửi OTP' });
   }
  }

  // 2. Xác thực OTP
  async confirmForgotPasswordOTP(req: Request, res: Response) : Promise<any>{
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ 
          success: false,
          message: 'Thiếu thông tin email hoặc OTP' });
      }
  
      const cacheKey = `forgot-password:${email}`;
      const cachedOTP = await cacheHelper.getKey<string>(cacheKey);
  
      if (!cachedOTP) {
        return res.status(400).json({
          success: false,
          message: 'OTP đã hết hạn' });
      }
  
      if (cachedOTP !== otp) {
        return res.status(400).json({ 
          success: false,
          message: 'OTP không hợp lệ' });
      }
  
      // Đánh dấu OTP đã xác thực
      await cacheHelper.setKeyValueExpire(`forgot-password:verified:${email}`, true, 10 * 60); // 10 phút
  
      return res.status(200).json({ 
        success: true,
        message: 'Xác thức OTP thanh cong' });
    } catch (error) {
      console.log("error confirmForgotPasswordOTP", error);
    
    return res.status(401).json({ 
      success: false,
      message: 'Lỗi xác thức OTP ' });
     }
    }

  // 3. Đổi mật khẩu
  async forgotPassword(req: Request, res: Response) : Promise<any>{
    try {
      const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin email hoặc mật khẩu'});
    }

    const isVerified = await cacheHelper.getKey(`forgot-password:verified:${email}`);
    if (!isVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'OTP hết hiệu lực' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.UserModel.updateOne({ email }, { password: hashedPassword });

    await cacheHelper.delMultiKey([
      `forgot-password:${email}`,
      `forgot-password:verified:${email}`,
    ]);

    return res.status(201).json({
      success: true,
      message: 'Đổi mât khẩu thành công' });
    } catch (error) {
      console.log("error forgotPassword", error);
      
      return res.status(401).json({ 
        success: false,
        message: 'Lỗi đổi mật khâu' });
    }
  }

  async changePassword(req: Request, res: Response) : Promise<any>{
    try {
      const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Thiếu thông tin email hoặc mật khẩu'});
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.UserModel.updateOne({ email }, { password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: 'Đổi mât khẩu thành công' });
    } catch (error) {
      console.log("error changePassword", error);
      
      return res.status(401).json({ 
        success: false,
        message: 'Lỗi đổi mật khâu' });
    }
  }
}

export default UserController;
