import { jwtVerify } from "jose";
import jwt from "jsonwebtoken";
import jwtPayload from "../types/jwt";
import UserType from "../types/interface/IUser";

class Jwt {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || "tungdev@123321";
  }

  generateToken(user: UserType) {
    const token = jwt.sign({ user }, this.secret, {
      expiresIn: "30d",
    });

    return token;
  }

  async verifyToken(token: string) {
    try {
      const encoder = new TextEncoder();
      const secretKey = encoder.encode(this.secret);

      return (await jwtVerify(token, secretKey)) as jwtPayload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

export default Jwt;
