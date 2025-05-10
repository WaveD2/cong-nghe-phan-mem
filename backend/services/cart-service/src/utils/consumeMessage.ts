import processData from "../kafka/proccessData";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import ICart from "../types/interface/ICart";
import IProduct from "../types/interface/IProduct";

// file tạo các tuyến đường lắng nghe thông báo
const consumeMessage = () => {
  processData<IProduct>("Product-Topic", "product-service-group", Product); // For Product (Product-Service)
  processData<ICart>("Order-Topic-Cart", "cart-service-group", Cart); // For Cart From Order
  processData<IProduct>("Order-Topic-Product", "order-service-product-group", Product); // For Product From Order
};

export default consumeMessage;
