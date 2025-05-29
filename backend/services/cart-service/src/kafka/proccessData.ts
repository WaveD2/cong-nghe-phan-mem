import { Document, Model, ObjectId } from "mongoose";
import { TOPIC_TYPE } from "../types/kafkaType";
import { Event } from "../types/events";
import { TPayload } from "../types/consumeType";
import MessageBroker from "../utils/messageBroker";
import { config } from "dotenv";

config();

interface ConsumerConfig<T extends Document> {
  topic: TOPIC_TYPE;
  groupId: string;
  model: Model<T>;
}

/**
 * Create document if it doesn't exist
 */
const createDocument = async <T>(id: string | ObjectId, data: T, model: Model<T>): Promise<void> => {
  try {
    const exists = await model.exists({ _id: id });
    if (!exists) {
      await model.create(data);
      console.log(`[CREATE] ${model.modelName} created with ID: ${id}`);
    }
  } catch (error) {
    console.error(`[CREATE] ${model.modelName} error for ID ${id}:`, (error as Error).message);
  }
};

/**
 * Update document by _id
 */
const updateDocument = async <T>(id: string | ObjectId, data: Partial<T>, model: Model<T>): Promise<void> => {
  try {
    const updated = await model.findOneAndUpdate({ _id: id }, { $set: data }, { new: true });
    if (updated) {
      console.log(`[UPDATE] ${model.modelName} updated with ID: ${id}`);
    }
  } catch (error) {
    console.error(`[UPDATE] ${model.modelName} error for ID ${id}:`, (error as Error).message);
  }
};

/**
 * Delete document by _id
 */
const deleteDocument = async <T>(id: string | ObjectId, model: Model<T>): Promise<void> => {
  try {
    const deleted = await model.findOneAndDelete({ _id: id });
    if (deleted) {
      console.log(`[DELETE] ${model.modelName} deleted with ID: ${id}`);
    }
  } catch (error) {
    console.error(`[DELETE] ${model.modelName} error for ID ${id}:`, (error as Error).message);
  }
};

/**
 * Upsert document by _id
 */
const upsertDocument = async <T>(id: string | ObjectId, data: Partial<T>, model: Model<T>): Promise<void> => {
  try {
    const upserted = await model.findOneAndUpdate({ _id: id }, { $set: data }, { upsert: true, new: true });
    console.log(`[UPSERT] ${model.modelName} upserted with ID: ${id}`);
  } catch (error) {
    console.error(`[UPSERT] ${model.modelName} error for ID ${id}:`, (error as Error).message);
  }
};

const insertManyDocument = async <T>(data: Partial<T>, model: Model<T>): Promise<void> => {
  try {
    const records = await model.insertMany(data);
    console.log(`[insertManyDocument] ${model.modelName}`);
  } catch (error) {
    console.error(`[insertManyDocument] ${model.modelName} error`, (error as Error).message);
  }
};

/**
 * Handle Kafka event based on payload
 */
const handleEvent = async <T>(payload: TPayload<T>, model: Model<T>): Promise<void> => {
  const { event, message } = payload;

  const id = message.data._id as string | ObjectId;

  if (!id && event !== Event.INSERT) {
    console.warn(`[Invalid Payload] Missing _id in ${model.modelName} message`);
    return;
  }

  switch (event) {
    case Event.CREATE:
      await createDocument(id, message.data, model);
      break;
    case Event.UPDATE:
      await updateDocument(id, message.data, model);
      break;
    case Event.DELETE:
      await deleteDocument(id, model);
      break;
    case Event.UPSERT:
      await upsertDocument(id, message.data, model);
      break;
    case Event.INSERT:
        await insertManyDocument( message.data, model);
        break;
    default:
      console.warn(`[Unknown Event] ${event} for ${model.modelName}`);
  }
};

/**
 * Subscribe to Kafka topic and process messages
 */
const processData = async <T extends Document>({ topic, groupId, model }: ConsumerConfig<T>): Promise<void> => {
  const kafka = new MessageBroker();

  try {
    await kafka.subscribe(topic, groupId, async (payload: TPayload<T>) => {
      try {
        await handleEvent(payload, model);
      } catch (err) {
        console.error(`[Kafka Consumer Error] Topic: ${topic}, Group: ${groupId}`, (err as Error).message);
      }
    });
    console.log(`[Kafka] ${groupId} subscribed to topic "${topic}"`);
  } catch (error) {
    console.error(`[Kafka Subscription Error] Topic: ${topic}, Group: ${groupId}`, (error as Error).message);
  }
};


export default processData;
