export interface MqttIngressMessage {
  topic: string;
  payload: string;
}

export class MqttConsumer {
  parse(topic: string, payload: string): MqttIngressMessage {
    return { topic, payload };
  }
}
