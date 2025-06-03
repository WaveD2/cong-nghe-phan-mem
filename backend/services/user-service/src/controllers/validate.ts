import { z } from 'zod';

export const userValidator = z.object({
  name: z
    .string({ required_error: 'Tên là bắt buộc' })
    .min(1, 'Tên không được để trống'),

  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email('Email không hợp lệ'),

  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),

  role: z
    .enum(['user', 'admin'])
    .default('user'),

  phone: z
    .string({ required_error: 'Sđt là bắt buộc' })
    .min(6, 'Số điện thoại chưa đúng định dạng sđt')
    .max(13 , 'Số điện thoại chưa đúng định dạng sđt'),

  avatar: z
    .string()
    .url('Avatar phải là URL hợp lệ')
    .default('https://images.pexels.com/photos/13288544/pexels-photo-13288544.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
});


export const userLoginValidator = z.object({
  email: z
    .string({ required_error: 'Email là bắt buộc' })
    .email('Email không hợp lệ'),

  password: z
    .string({ required_error: 'Mật khẩu là bắt buộc' })
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
