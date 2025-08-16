import { Channel, ConsumeMessage } from 'amqplib';
import { MessageHandler } from './messageHandiler';
import { OrderController } from '../../controller/implementations/order.controller';
import { OrderRepository } from '../../repositories/implementations/order.repository';
import { OrderService } from '../../services/implementations/order.service';

export default class Consumer {
  private channel: Channel;
  private rpcQueue: string;
  private controllers: {
    orderController: OrderController;
  };

  constructor(channel: Channel, rpcQueue: string) {
    this.channel = channel;
    this.rpcQueue = rpcQueue;

    const orderRepository = new OrderRepository();
    const orderService = new OrderService(orderRepository);

    this.controllers = {
      orderController: new OrderController(orderService),
    };
  }

  async consumeMessage() {
    console.log('Ready to consume messages...');

    this.channel.consume(
      this.rpcQueue,
      async (message: ConsumeMessage | null) => {
        if (!message) return;

        const { correlationId, replyTo } = message.properties;
        const operation = message.properties.headers?.function;

        if (!correlationId || !replyTo) {
          console.log('Missing correlationId or replyTo.');
          this.channel.ack(message);
          return;
        }

        try {
          const content = JSON.parse(message.content.toString());
          await MessageHandler.handle(operation, content, correlationId, replyTo, this.controllers);
          this.channel.ack(message);
        } catch (err) {
          console.error('Error handling message:', err);
          // this.channel.nack(message, false, true); 
          this.channel.nack(message, false, false); 
        }
      },
      { noAck: false }
    );
  }
}