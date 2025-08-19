import { Channel } from 'amqplib';

export default class Producer {
  constructor(
    private readonly _channel: Channel
  ) { }

  async produceMessages(data: any, correlationId: string, replyToQueue: string) {
    this._channel.sendToQueue(replyToQueue, Buffer.from(JSON.stringify(data)), {
      correlationId,
    });
  }
}

