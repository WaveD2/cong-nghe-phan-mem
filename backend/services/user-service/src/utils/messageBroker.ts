import { Kafka, logLevel, Partitioners, Producer } from "kafkajs";
import IKafka from "../types/interface/IKafka";
import { TOPIC_TYPE, messagetype, UserEvent } from "../types/kafkaTypes";

const KAFKA_CLIENT_ID = "user-service";
const KAFKA_BROKERS = ["kafka:29092"];

class MessageBroker implements IKafka {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: KAFKA_BROKERS,
      logLevel: logLevel.ERROR
    });

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });

    this.connectProducer(); // Connection Function Call
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

  //  Publish Setup :-

  async publish(
    topic: TOPIC_TYPE,
    message: messagetype,
    event: UserEvent
  ): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message), key: event }],
      });
      console.log(`Message sent to topic ${topic}:`, message);
    } catch (error) {
      console.error(`Failed to publish message to topic ${topic}:`, error);
    }
  }
}

export default MessageBroker;
