import { jwtVerify } from "jose";
import jwt from "jsonwebtoken";

class Jwt {
  private secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || "tungdev@123321";
  }

  generateToken(userId: string) {
    const token = jwt.sign({ userId }, this.secret, {
      expiresIn: "30d",
    });

    return token;
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
