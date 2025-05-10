import processData from "../kafka/proccesData";
import Product from "../models/productModel";
import { ProductType } from "../types/interface/IProduct";

const consumeMessage = () => {
  processData<ProductType>("Order-Topic-Product", "product_group", Product);  // For Product
};

export default consumeMessage;
