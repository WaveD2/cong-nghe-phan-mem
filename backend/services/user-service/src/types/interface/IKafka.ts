import { messagetype, TOPIC_TYPE, UserEvent } from "../kafkaTypes";

export default interface IKafka {
  publish(
    topic: TOPIC_TYPE,
    message: messagetype,
    event: UserEvent
  ): Promise<void>;
}
