import {
  createConsumer,
  ORDER_TOPICS,
  PAYMENT_TOPICS,
} from '@packages/libs/kafka';
import prisma from '@packages/libs/prisma';
import { publishPaymentEvent } from './kafka.producer';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-01-28.clover',
});

export const startPaymentConsumer = async () => {
  try {
    const consumer = await createConsumer('payment-service-group');

    await consumer.subscribe({
      topics: [ORDER_TOPICS.ORDER_CANCELLED],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        const data = JSON.parse(message.value?.toString() || '{}');
        console.log(`[payment-service] Received ${topic}:`, data.id);

        switch (topic) {
          case ORDER_TOPICS.ORDER_CANCELLED: {
            // Auto-refund when order is cancelled
            if (data.paymentId) {
              const payment = await prisma.payment.findUnique({
                where: { id: data.paymentId },
              });

              if (payment && payment.status === 'succeeded') {
                try {
                  // Create Stripe refund
                  await stripe.refunds.create({
                    payment_intent: payment.stripePaymentId,
                  });

                  // Update payment status
                  await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'refunded' },
                  });

                  publishPaymentEvent(PAYMENT_TOPICS.PAYMENT_REFUNDED, {
                    id: payment.id,
                    orderId: data.id,
                    stripePaymentId: payment.stripePaymentId,
                    amount: payment.amount,
                  });

                  console.log(
                    `[payment-service] Refund processed for order ${data.id}`
                  );
                } catch (err) {
                  console.error(
                    `[payment-service] Refund failed for order ${data.id}:`,
                    err
                  );
                }
              }
            }
            break;
          }
        }
      },
    });

    console.log('[payment-service] Kafka consumer started');
  } catch (error) {
    console.error('[payment-service] Failed to start Kafka consumer:', error);
    setTimeout(startPaymentConsumer, 5000);
  }
};
