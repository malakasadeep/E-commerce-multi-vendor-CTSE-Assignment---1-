import { createConsumer, PAYMENT_TOPICS } from '@packages/libs/kafka';
import prisma from '@packages/libs/prisma';

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
        console.log(`[order-service] Received ${topic}:`, data.id || data.orderId);

        switch (topic) {
          case PAYMENT_TOPICS.PAYMENT_SUCCEEDED: {
            // Confirm the order when payment succeeds
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
                console.log(`[order-service] Order ${data.orderId} confirmed via Kafka`);
              }
            }
            break;
          }

          case PAYMENT_TOPICS.PAYMENT_REFUNDED: {
            // Mark order as refunded
            if (data.orderId) {
              await prisma.order.update({
                where: { id: data.orderId },
                data: { status: 'refunded' },
              });
              await prisma.orderItem.updateMany({
                where: { orderId: data.orderId },
                data: { status: 'cancelled' },
              });
              console.log(`[order-service] Order ${data.orderId} refunded via Kafka`);
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
