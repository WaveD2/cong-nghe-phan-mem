import { messageType, ProductEvent, TOPIC_TYPE } from "../kafkaType";

export default interface IKafka {
  publish(
    topic: TOPIC_TYPE,
    message: messageType,
    event: ProductEvent
  ): Promise<void>;
  subscribe(
    topic: TOPIC_TYPE,
    groupId: string,
    messageHandler: Function
  ): Promise<void>;
}
