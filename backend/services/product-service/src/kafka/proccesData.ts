import { Document, Model, ObjectId } from "mongoose";
import { TOPIC_TYPE } from "../types/kafkaType";
import MessageBroker from "../utils/messageBroker";
import { TPayload } from "../types/consumeType";
import { Event } from "../types/events";
import { config } from "dotenv";

config();

const service = process.env.SERVICE || "product-service";

const Create = async <T>(id: string | ObjectId, data: T, model: Model<T>) => {
  try {
    const exist = await model.findOne({ _id: id });
    if (!exist) {
      await model.create(data);
    }
  } catch (error) {
    console.log((error as Error).message);
  }
};

const Update = async <T>(
  id: string | ObjectId,
  data: Record<string, any>,
  model: Model<T>
) => {
  try {
    await model.findOneAndUpdate({ _id: id }, data);
  } catch (error) {
    console.log("Error proccessing data : ", (error as Error).message);
  }
};

const Delete = async <T>(id: string | ObjectId, model: Model<T>) => {
  try {
    await model.findOneAndDelete({ _id: id });
  } catch (error) {
    console.log((error as Error).message);
  }
};

function switchFun<T>(payload: TPayload<T>, model: Model<T>) {
  switch (payload.event) {
    case Event.CREATE:
      Create<T>(
        payload.message.data._id as string | ObjectId,
        payload.message.data,
        model
      );
      break;
    case Event.UPDATE:
      Update<T>(
        payload.message.data._id as string | ObjectId,
        payload.message.data,
        model
      );
      break;
    case Event.DELETE:
      Delete<T>(payload.message.data._id as string | ObjectId, model);
      break;
  }
}

const processData = async <T extends Document>(
  topic: TOPIC_TYPE,
  groupName: string,
  model: Model<T>
) => {
  const kafka = new MessageBroker();

  await kafka.subscribe(
    topic,
    `${service}-${groupName}`,
    (paylaod: TPayload<T>) => switchFun(paylaod, model)
  );
};

export default processData;
