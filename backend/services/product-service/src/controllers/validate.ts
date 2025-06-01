import { z } from 'zod';

export const productValidator = z.object({
  title: z
    .string({ required_error: "Tiêu đề là bắt buộc" })
    .min(1, "Tiêu đề không được để trống")
    .trim(),
  
  description: z
    .string({ required_error: "Mô tả là bắt buộc" })
    .min(1, "Mô tả không được để trống")
    .trim(),

  category: z
    .string({ required_error: "Danh mục là bắt buộc" })
    .min(1, "Danh mục không được để trống"),

  price: z
    .number({ invalid_type_error: "Giá phải là số" })
    .min(0, "Giá không được nhỏ hơn 0"),

  discount: z
    .number()
    .min(0, "Giảm giá không được nhỏ hơn 0")
    .max(100, "Giảm giá không được lớn hơn 100")
    .default(0),

  discountedPrice: z
    .number()
    .min(0, "Giá sau giảm không được nhỏ hơn 0")
    .optional(),

  stock: z
    .number({ invalid_type_error: "Số lượng kho phải là số" })
    .min(0, "Số lượng kho không được nhỏ hơn 0"),

  tags: z
    .array(z.string())
    .optional(),

  brand: z
    .string()
    .default("Others"),

  sku: z
    .string()
    .optional(),

  images: z
    .array(z.string().url("URL ảnh không hợp lệ"))
    .optional(),

  thumbnail: z
    .string()
    .url("Thumbnail phải là URL hợp lệ")
    .optional(),
});
