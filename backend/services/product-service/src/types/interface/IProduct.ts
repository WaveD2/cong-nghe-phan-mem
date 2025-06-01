import {  Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  discount: number;
  discountedPrice?: number;
  stock: number;
  tags: string[];
  brand: string;
  sku?: string;
  images: string[];
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}