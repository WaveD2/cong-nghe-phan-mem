import processData from "../kafka/proccesData";
import Product from "../models/productModel";
import { ProductType } from "../types/interface/IProduct";

const consumeMessage = () => {
  processData<ProductType>({topic: "Order-Topic-Product", groupId: "order-product-group", model: Product}); 
};

export default consumeMessage;
