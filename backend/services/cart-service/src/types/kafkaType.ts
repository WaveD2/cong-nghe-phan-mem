export type messageType = Record<string, any> & {
  data: any;
};

export type TOPIC_TYPE =
  | "User-Topic"
  | "Cart-Topic"
  | "Order-Topic"
  | "Product-Topic"
  | "Order-Topic-Product"
  | "Order-Topic-Cart";
