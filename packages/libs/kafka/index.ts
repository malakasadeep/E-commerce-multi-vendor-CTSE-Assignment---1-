import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'eshop',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  logLevel: logLevel.WARN,
});

export const createProducer = async (): Promise<Producer> => {
  const producer = kafka.producer();
  await producer.connect();
  console.log('Kafka producer connected');
  return producer;
};

export const createConsumer = async (groupId: string): Promise<Consumer> => {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  console.log(`Kafka consumer connected (group: ${groupId})`);
  return consumer;
};

export const PRODUCT_TOPICS = {
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
} as const;

export default kafka;
