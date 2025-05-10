import { ObjectId } from "mongoose";

export type TPayload<T> = {
  event: string;
  message: {
    data: T & DocumentWithId
  };
};

export interface DocumentWithId {
  _id?: string | ObjectId ;
}