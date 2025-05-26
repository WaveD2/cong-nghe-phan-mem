import { Kafka, logLevel, Partitioners, Producer } from "kafkajs";
import IKafka from "../types/interface/IKafka";
import { TOPIC_TYPE, messageType, ProductEvent } from "../types/kafkaType";
import { config } from "dotenv";

config();

const KAFKA_CLIENT_ID = process.env.SERVICE || "product-service";
//localhost:9092
const KAFKA_BROKERS = process.env.KAFKA_BROKERS  ? [process.env.KAFKA_BROKERS] : ["kafka:29092"];

class MessageBroker implements IKafka {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    console.log("MessageBroker:::", KAFKA_BROKERS, KAFKA_CLIENT_ID);
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
      logLevel: logLevel.ERROR
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    this.connectProducer(); //  Connection
  }

  private async connectProducer(): Promise<void> {
    //  Connection
    try {
      await this.producer.connect();
      console.log("Kafka producer connected successfully.");
    } catch (error) {
      console.error("Failed to connect Kafka producer:", error);
    }
  }

  //  Publish Kafka Fun :-

  async publish(
    topic: TOPIC_TYPE,
    message: messageType,
    event: ProductEvent
  ): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message), key: event }],
    });
  }

  //  Subscribe Kafka Fun :-

  async subscribe(
    topic: TOPIC_TYPE,
    groupId: string,
    messageHandler: Function
  ): Promise<void> {
    try {
      const consumer = this.kafka.consumer({ groupId });
      await consumer.connect();
      await consumer.subscribe({ topic: topic, fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            console.log(`Received message on topic: ${topic}`);
            console.log(`Message value: ${String(message.value)}`);
            console.log(`Message key: ${message.key?.toString()}`);
            if (message.key && message.value) {
              const inpMessage = {
                event: message.key.toString(),
                message: message.value
                  ? JSON.parse(message.value.toString())
                  : null,
              };

              if (inpMessage.event && inpMessage.message) {
                console.log(inpMessage, "got it from product-service");
                await messageHandler(inpMessage);
              } else {
                console.warn(`Malformed message received: ${message}`);
              }
            }
          } catch (error) {
            console.error(
              `Error processing message: ${(error as Error).message}`
            );
          } finally {
            await consumer.commitOffsets([
              {
                topic,
                partition,
                offset: (Number(message.offset) + 1).toString(),
              },
            ]);
          }
        },
      });
    } catch (error) {
      console.error(`Error setting up consumer: ${(error as Error).message}`);
    }
  }
}

export default MessageBroker;
