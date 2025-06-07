import processData from "../kafka/proccesData";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import User from "../models/userModel";
import {ICart} from "../types/interface/ICart";
import {IProduct} from "../types/interface/IProduct";
import iUser from "../types/interface/IUser";

const consumeMessage = () => {
  processData<iUser>({topic: "User-Topic", groupId: "user-odder-group", model: User});  
  processData<IProduct>({topic: "Product-Topic", groupId: "product-order-group", model: Product});   
  processData<ICart>({topic: "Cart-Topic", groupId: "cart-order-group", model: Cart}); 
};

export default consumeMessage;
