import processData from "../kafka/proccessData";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import ICart from "../types/interface/ICart";
import IProduct from "../types/interface/IProduct";

const consumeMessage = () => {
  processData<IProduct>({topic: "Product-Topic", groupId: "product-cart-group", model: Product});   
  processData<ICart>({topic: "Order-Topic-Cart", groupId: "order-cart-group", model: Cart}); 
};

export default consumeMessage;
