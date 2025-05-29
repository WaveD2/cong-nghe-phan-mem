export type messageType = Record<string, any> & {
  data: any;
};

export enum ProductEvent {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  UPSERT = "UPSERT",
  INSERT = "INSERT",
}

export type TOPIC_TYPE =
  | "User_Topic"
  | "Cart_Topic"
  | "Product-Topic"
  | "Order_Topic"
  | "Order-Topic-Product";
