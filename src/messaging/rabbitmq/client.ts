import { Channel, connect, Connection } from 'amqplib';
import Consumer from './consumer';
import Producer from './producer';
import rabbitMQConfig from '../../config/rabbitmq.config';

export class RabbitMQClient {
  private static _instance: RabbitMQClient;
  private _isInitialized = false;
  private _producer?: Producer;
  private _consumer?: Consumer;
  private _connection?: Connection;
  private _producerChannel?: Channel;
  private _consumerChannel?: Channel;

  private constructor() { }

  public static getInstance() {
    if (!this._instance) {
      this._instance = new RabbitMQClient();
    }
    return this._instance;
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
    if (this._isInitialized) return;

    this._connection = await connect(rabbitMQConfig.rebbitMQ.url);
    const [producerChannel, consumerChannel] = await Promise.all([
      this._connection.createChannel(),
      this._connection.createChannel(),
    ]);

    this._producerChannel = producerChannel;
    this._consumerChannel = consumerChannel;

    const { queue: rpcQueue } = await this._consumerChannel.assertQueue(
      rabbitMQConfig.queue.orderServiceQueue,
      {
        durable: true,
        deadLetterExchange: '',
        deadLetterRoutingKey: 'order.dlq',
      }
    );

    this._producer = new Producer(this._producerChannel);
    this._consumer = new Consumer(this._consumerChannel, rpcQueue);
    this._consumer.consumeMessage();

    this._isInitialized = true;
  }

  async produce(data: any, correlationId: string, replyToQueue: string) {
    if (!this._isInitialized) {
      await this.initializeWithRetry();
    }
    return await this._producer?.produceMessages(data, correlationId, replyToQueue);
  }
}

export default RabbitMQClient.getInstance();