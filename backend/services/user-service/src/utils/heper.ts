import crypto from "crypto";
import { cacheHelper } from "../redis";

interface GenerateOptions {
  digits?: boolean;
  lowerCaseAlphabets?: boolean;
  upperCaseAlphabets?: boolean;
  specialChars?: boolean;
}

interface RequestOTPParams {
  cacheKey: string;
  ttlPerSeconds?: number;
}

interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export const helper = {
  convertTimeQuery(startDate?: Date | string, endDate?: Date | string): TimeRange {
    const timeStart = startDate ? new Date(startDate) : new Date();
    timeStart.setHours(0, 0, 0, 0);

    const timeEnd = endDate ? new Date(endDate) : new Date();
    timeEnd.setHours(23, 59, 59, 999);

    return {
      startDate: timeStart,
      endDate: timeEnd,
    };
  },

  async requestOTP({ cacheKey, ttlPerSeconds }: RequestOTPParams): Promise<{
    code?: string;
    isSend: boolean;
    ttlPerSeconds: number;
  }> {
    const cacheCode = await cacheHelper.getKey(cacheKey);
    const result: {
      code?: string;
      isSend: boolean;
      ttlPerSeconds: number;
    } = {
      isSend: !!cacheCode,
      ttlPerSeconds: ttlPerSeconds || 5 * 60,
    };

    if (!cacheCode) {
      const code = helper.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      await cacheHelper.getKeyIfNotDoSet(
        cacheKey,
        async () => code,
        result.ttlPerSeconds
      );

      result.code = code;
    } else {
      const ttl = await cacheHelper.getTTLByKey(cacheKey);
      if (ttl) result.ttlPerSeconds = ttl;
    }

    return result;
  },

  generate(length: number = 10, options?: GenerateOptions): string {
    const opts = {
      digits: options?.digits ?? true,
      lowerCaseAlphabets: options?.lowerCaseAlphabets ?? true,
      upperCaseAlphabets: options?.upperCaseAlphabets ?? true,
      specialChars: options?.specialChars ?? true,
    };

    let allowedChars = "";

    if (opts.digits) allowedChars += "0123456789";
    if (opts.lowerCaseAlphabets) allowedChars += "abcdefghijklmnopqrstuvwxyz";
    if (opts.upperCaseAlphabets) allowedChars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (opts.specialChars) allowedChars += "!@#$%^&*()-_+=[]{}|;:,.<>?";

    if (!allowedChars) {
      throw new Error("No character types selected for OTP generation.");
    }

    let otp = "";

    while (otp.length < length) {
      const index = crypto.randomInt(0, allowedChars.length);
      const char = allowedChars[index];

      // Tránh bắt đầu bằng '0' nếu yêu cầu chữ số
      if (otp.length === 0 && opts.digits && char === "0") {
        continue;
      }

      otp += char;
    }

    return otp;
  },
};
