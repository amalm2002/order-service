import { Channel, connect, Connection } from 'amqplib';
import Consumer from './consumer';
import Producer from './producer';
import rabbitMQConfig from '../../config/rabbitmq.config';

export class RabbitMQClient {
  private static instance: RabbitMQClient;
  private isInitialized = false;
  private producer?: Producer;
  private consumer?: Consumer;
  private connection?: Connection;
  private producerChannel?: Channel;
  private consumerChannel?: Channel;

  private constructor() {}

  public static getInstance() {
    if (!this.instance) {
      this.instance = new RabbitMQClient();
    }
    return this.instance;
  }

  async initializeWithRetry(retries = 5, delay = 1000) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        await this.initialize();
        console.log('RabbitMQ connected.');
        return;
      } catch (err) {
        console.error(`RabbitMQ connection failed. Retry ${attempt + 1}/${retries}`);
        await new Promise((res) => setTimeout(res, delay * (attempt + 1)));
      }
    }
    console.error('Could not connect to RabbitMQ after retries.');
  }

  async initialize() {
    if (this.isInitialized) return;

    this.connection = await connect(rabbitMQConfig.rebbitMQ.url);
    const [producerChannel, consumerChannel] = await Promise.all([
      this.connection.createChannel(),
      this.connection.createChannel(),
    ]);

    this.producerChannel = producerChannel;
    this.consumerChannel = consumerChannel;

    const { queue: rpcQueue } = await this.consumerChannel.assertQueue(
      rabbitMQConfig.queue.orderServiceQueue,
      {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: 'order.dlq',
      }
    );

    this.producer = new Producer(this.producerChannel);
    this.consumer = new Consumer(this.consumerChannel, rpcQueue);
    this.consumer.consumeMessage();

    this.isInitialized = true;
  }

  async produce(data: any, correlationId: string, replyToQueue: string) {
    if (!this.isInitialized) {
      await this.initializeWithRetry();
    }
    return await this.producer?.produceMessages(data, correlationId, replyToQueue);
  }
}

export default RabbitMQClient.getInstance();