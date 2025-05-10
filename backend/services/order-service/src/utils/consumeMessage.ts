import processData from "../kafka/proccesData";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import User from "../models/userModel";
import ICart from "../types/interface/ICart";
import IProduct from "../types/interface/IProduct";
import iUser from "../types/interface/IUser";

const consumeMessage = () => {
  processData<iUser>("User-Topic", "user-group", User); // For User
  processData<IProduct>("Product-Topic", "product-group", Product); // For Product
  processData<ICart>("Cart-Topic", "cart-group", Cart); // For Cart
};

export default consumeMessage;
