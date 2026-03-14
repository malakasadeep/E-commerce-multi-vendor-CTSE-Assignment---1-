import { createProducer } from '@packages/libs/kafka';
import { Producer } from 'kafkajs';

let producer: Producer | null = null;

const getProducer = async (): Promise<Producer> => {
  if (!producer) {
    producer = await createProducer();
  }
  return producer;
};

export const publishOrderEvent = async (
  topic: string,
  data: Record<string, any>
) => {
  try {
    const prod = await getProducer();
    await prod.send({
      topic,
      messages: [
        {
          key: data.id || data.orderId,
          value: JSON.stringify(data),
        },
      ],
    });
    console.log(`Published event to ${topic}:`, data.id || data.orderId);
  } catch (error) {
    console.error(`Failed to publish event to ${topic}:`, error);
  }
};
