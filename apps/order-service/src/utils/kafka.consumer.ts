import {
  createConsumer,
  ORDER_TOPICS,
  PAYMENT_TOPICS,
} from '@packages/libs/kafka';
import prisma from '@packages/libs/prisma';
import { publishOrderEvent } from './kafka.producer';

export const startOrderConsumer = async () => {
  try {
    const consumer = await createConsumer('order-service-group');

    await consumer.subscribe({
      topics: [
        PAYMENT_TOPICS.PAYMENT_SUCCEEDED,
        PAYMENT_TOPICS.PAYMENT_REFUNDED,
      ],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const data = JSON.parse(message.value?.toString() || '{}');
        console.log(
          `[order-service] Received ${topic}:`,
          data.id || data.orderId
        );

        switch (topic) {
          case PAYMENT_TOPICS.PAYMENT_SUCCEEDED: {
            // Confirm the order. product-service owns stock; we publish
            // ORDER_CONFIRMED so it can decrement stock authoritatively.
            if (data.orderId) {
              const order = await prisma.order.findUnique({
                where: { id: data.orderId },
              });

              if (order && order.status === 'pending') {
                await prisma.order.update({
                  where: { id: data.orderId },
                  data: { status: 'confirmed' },
                });
                await prisma.orderItem.updateMany({
                  where: { orderId: data.orderId },
                  data: { status: 'confirmed' },
                });
                publishOrderEvent(ORDER_TOPICS.ORDER_CONFIRMED, {
                  id: order.id,
                  orderNumber: order.orderNumber,
                });
                console.log(
                  `[order-service] Order ${data.orderId} confirmed via Kafka`
                );
              }
            }
            break;
          }

          case PAYMENT_TOPICS.PAYMENT_REFUNDED: {
            // Mark order refunded. product-service handles stock restoration
            // when it receives ORDER_REFUNDED.
            if (data.orderId) {
              const order = await prisma.order.findUnique({
                where: { id: data.orderId },
              });

              if (order && order.status !== 'refunded') {
                const wasConfirmed = order.status !== 'pending';
                await prisma.order.update({
                  where: { id: data.orderId },
                  data: { status: 'refunded' },
                });
                await prisma.orderItem.updateMany({
                  where: { orderId: data.orderId },
                  data: { status: 'cancelled' },
                });
                publishOrderEvent(ORDER_TOPICS.ORDER_REFUNDED, {
                  id: order.id,
                  orderNumber: order.orderNumber,
                  stockWasDecremented: wasConfirmed,
                });
                console.log(
                  `[order-service] Order ${data.orderId} refunded via Kafka`
                );
              }
            }
            break;
          }
        }
      },
    });

    console.log('[order-service] Kafka consumer started');
  } catch (error) {
    console.error('[order-service] Failed to start Kafka consumer:', error);
    // Retry after 5 seconds
    setTimeout(startOrderConsumer, 5000);
  }
};
