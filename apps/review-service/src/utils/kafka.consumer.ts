import {
  createConsumer,
  ORDER_TOPICS,
  PRODUCT_TOPICS,
  REVIEW_TOPICS,
} from '@packages/libs/kafka';
import prisma from '@packages/libs/prisma';
import { publishReviewEvent } from './kafka.producer';

export const startReviewConsumer = async () => {
  try {
    const consumer = await createConsumer('review-service-group');

    await consumer.subscribe({
      topics: [ORDER_TOPICS.ORDER_DELIVERED, PRODUCT_TOPICS.PRODUCT_DELETED],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const data = JSON.parse(message.value?.toString() || '{}');
        console.log(`[review-service] Received ${topic}:`, data.id);

        switch (topic) {
          case ORDER_TOPICS.ORDER_DELIVERED: {
            // Nothing to persist yet — eligibility is derived from order status
            // at read time. This handler exists so reviewers can extend it
            // (notifications, "review nudge" emails, analytics).
            console.log(
              `[review-service] Order ${data.id} delivered — review now allowed`
            );
            break;
          }

          case PRODUCT_TOPICS.PRODUCT_DELETED: {
            // Cascade-delete reviews for the removed product so we don't show
            // orphaned ratings or skew aggregates.
            const productId = data.id;
            if (!productId) break;

            const removed = await prisma.productReview.deleteMany({
              where: { productId },
            });

            if (removed.count > 0) {
              console.log(
                `[review-service] Removed ${removed.count} reviews for deleted product ${productId}`
              );
              publishReviewEvent(REVIEW_TOPICS.REVIEW_DELETED, {
                id: productId,
                type: 'product-cascade',
                count: removed.count,
              });
            }
            break;
          }
        }
      },
    });

    console.log('[review-service] Kafka consumer started');
  } catch (error) {
    console.error('[review-service] Failed to start Kafka consumer:', error);
    setTimeout(startReviewConsumer, 5000);
  }
};
