import { Channel, ConsumeMessage } from 'amqplib';
import { MessageHandler } from './messageHandiler';
import { OrderController } from '../../controller/implementations/order.controller';
import { OrderRepository } from '../../repositories/implementations/order.repository';
import { OrderService } from '../../services/implementations/order.service';

export default class Consumer {
  private readonly _channel: Channel;
  private readonly _rpcQueue: string;
  private readonly _controllers: {
    orderController: OrderController;
  };

  constructor(channel: Channel, rpcQueue: string) {
    this._channel = channel;
    this._rpcQueue = rpcQueue;

    const orderRepository = new OrderRepository();
    const orderService = new OrderService(orderRepository);

    this._controllers = {
      orderController: new OrderController(orderService),
    };
  }

  async consumeMessage() {
    console.log('Ready to consume messages...');

    this._channel.consume(
      this._rpcQueue,
      async (message: ConsumeMessage | null) => {
        if (!message) return;

        const { correlationId, replyTo } = message.properties;
        const operation = message.properties.headers?.function;

        if (!correlationId || !replyTo) {
          console.log('Missing correlationId or replyTo.');
          this._channel.ack(message);
          return;
        }

        try {
          const content = JSON.parse(message.content.toString());
          await MessageHandler.handle(operation, content, correlationId, replyTo, this._controllers);
          this._channel.ack(message);
        } catch (err) {
          console.error('Error handling message:', err);
          // this._channel.nack(message, false, true); 
          this._channel.nack(message, false, false); 
        }
      },
      { noAck: false }
    );
  }
}