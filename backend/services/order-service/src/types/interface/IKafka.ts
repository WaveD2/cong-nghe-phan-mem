import { messageType, TOPIC_TYPE } from "../kafkaType";
import { Event } from "../events";

export default interface IKafka {
  publish(topic: TOPIC_TYPE, message: messageType, event: Event): Promise<void>;
  subscribe(
    topic: TOPIC_TYPE,
    groupId: string,
    messageHandler: Function
  ): Promise<void>;
}
