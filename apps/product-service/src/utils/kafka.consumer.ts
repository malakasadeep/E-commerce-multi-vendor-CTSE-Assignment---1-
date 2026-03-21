import { createConsumer, ORDER_TOPICS } from '@packages/libs/kafka';
import prisma from '@packages/libs/prisma';

export const startProductConsumer = async () => {
  try {
    const consumer = await createConsumer('product-service-group');

    await consumer.subscribe({
      topics: [ORDER_TOPICS.ORDER_CANCELLED, ORDER_TOPICS.ORDER_REFUNDED],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const data = JSON.parse(message.value?.toString() || '{}');
        console.log(`[product-service] Received ${topic}:`, data.id);

        switch (topic) {
          case ORDER_TOPICS.ORDER_CANCELLED:
          case ORDER_TOPICS.ORDER_REFUNDED: {
            // Restore stock for cancelled/refunded orders
            if (data.id) {
              const orderItems = await prisma.orderItem.findMany({
                where: { orderId: data.id },
              });

              for (const item of orderItems) {
                await prisma.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                });
                console.log(
                  `[product-service] Restored ${item.quantity} stock for product ${item.productId}`
                );
              }
            }
            break;
          }
        }
      },
    });

    console.log('[product-service] Kafka consumer started');
  } catch (error) {
    console.error('[product-service] Failed to start Kafka consumer:', error);
    setTimeout(startProductConsumer, 5000);
  }
};
