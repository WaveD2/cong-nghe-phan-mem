import { Schema, model, models } from 'mongoose';
import { IProduct } from '../types/interface/IProduct';
const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
      max: 100,
    },
    discountedPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      default: 'Others',
    },
    sku: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: String,
    },
  },
  { timestamps: true }
);

ProductSchema.pre<IProduct>('save', function (next) {
  if (this.discount > 0) {
    this.discountedPrice = this.price * (1 - this.discount / 100);
  } else {
    this.discountedPrice = this.price;
  }
  next();
});

const Product = models.Product || model<IProduct>('Product', ProductSchema);
export default Product;
