import { Document, Model, ObjectId } from "mongoose";
import { TOPIC_TYPE } from "../types/kafkaTypes";
import MessageBroker from "../utils/messageBroker";
import { Event } from "../types/events";
import { config } from "dotenv";
import { TPayload } from "../types/consumeType";

config();

const service = process.env.SERVICE || "user-service";

const Create = async <T>(id: string | ObjectId, data: T, model: Model<T>) => {
  try {
    const exist = await model.findOne({ _id: id });
    if (!exist) {
      await model.create(data);
    }
  } catch (error) {
    console.log("Error create data : ", (error as Error).message);
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
    console.log("Error Update data : ", (error as Error).message);
  }
};

const Delete = async <T>(id: string | ObjectId, model: Model<T>) => {
  try {
    await model.findOneAndDelete({ _id: id });
  } catch (error) {
    console.log("Error Delete data : ", (error as Error).message);
  }
};

const Upsert = async <T>(
  id: string | ObjectId,
  data: Record<string, any>,
  model: Model<T>
) => {
  try {
    await model.findOneAndUpdate({ _id: id }, data, { upsert: true });
  } catch (error) {
    console.log("Error Upsert data : ", (error as Error).message);
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
    case Event.UPSERT:
      Upsert<T>(
        payload.message.data._id as string | ObjectId,
        payload.message.data,
        model
      );
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
    (payload: TPayload<T>) => switchFun(payload, model)
  );
};

export default processData;
