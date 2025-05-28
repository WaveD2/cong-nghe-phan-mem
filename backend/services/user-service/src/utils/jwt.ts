import { jwtVerify } from "jose";
import jwt from "jsonwebtoken";
import { UserType } from "../types/interface/IUser";
import { tokenToString } from "typescript";

class Jwt {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || "tungdev@123321";
  }

  generateToken(user : UserType) {
    const accessToken = jwt.sign({ user }, this.secret, {
      expiresIn: "1d",
    });

    const refreshToken  = jwt.sign({ user }, this.secret, {
      expiresIn: "30d",
    });

    return { accessToken, refreshToken};
  }

  async verifyToken(token: string) {
    try {
      const encoder = new TextEncoder();
      const secretKey = encoder.encode(this.secret);

      return await jwtVerify(token, secretKey);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

export default Jwt;
