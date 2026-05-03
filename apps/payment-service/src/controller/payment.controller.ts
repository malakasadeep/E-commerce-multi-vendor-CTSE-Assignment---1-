import { NextFunction, Request, Response } from 'express';
import prisma from '@packages/libs/prisma';
import { ValidationError, NotFoundError } from '@packages/error-handler';
import { publishPaymentEvent } from '../utils/kafka.producer';
import { PAYMENT_TOPICS } from '@packages/libs/kafka';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// User: Create payment intent for an order
export const createPaymentIntent = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { orderId } = req.body;

    if (!orderId) {
      return next(new ValidationError('Order ID is required'));
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });

    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    if (order.userId !== user.id) {
      return next(new ValidationError('You can only pay for your own orders'));
    }

    if (order.payment && order.payment.status === 'succeeded') {
      return next(new ValidationError('This order has already been paid'));
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Stripe uses cents
      currency: 'usd',
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: user.id,
      },
    });

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: {
        stripePaymentId: paymentIntent.id,
      },
      update: {},
      create: {
        stripePaymentId: paymentIntent.id,
        userId: user.id,
        amount: order.total,
        currency: 'usd',
        status: 'pending',
      },
    });

    // Link payment to order
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentId: payment.id },
    });

    publishPaymentEvent(PAYMENT_TOPICS.PAYMENT_CREATED, {
      id: payment.id,
      orderId: order.id,
      amount: order.total,
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    });
  } catch (error) {
    return next(error);
  }
};

// Stripe webhook handler
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res
      .status(500)
      .json({ error: 'Webhook secret not configured on server' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res
      .status(400)
      .json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        // Update payment status
        const payment = await prisma.payment.update({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'succeeded' },
        });

        // Update order status to confirmed
        const order = await prisma.order.findFirst({
          where: { paymentId: payment.id },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'confirmed' },
          });

          // Update all order items to confirmed
          await prisma.orderItem.updateMany({
            where: { orderId: order.id },
            data: { status: 'confirmed' },
          });
        }

        publishPaymentEvent(PAYMENT_TOPICS.PAYMENT_SUCCEEDED, {
          id: payment.id,
          orderId: order?.id,
          stripePaymentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
        });

        // Transfer funds to sellers
        if (order) {
          await transferToSellers(order.id);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);

        await prisma.payment.update({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'failed' },
        });

        publishPaymentEvent(PAYMENT_TOPICS.PAYMENT_FAILED, {
          stripePaymentId: paymentIntent.id,
        });

        break;
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Transfer seller amounts to their Stripe connected accounts
async function transferToSellers(orderId: string) {
  try {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
    });

    // Group amounts by seller
    const sellerAmounts: Record<string, number> = {};
    for (const item of orderItems) {
      sellerAmounts[item.sellerId] =
        (sellerAmounts[item.sellerId] || 0) + item.sellerAmount;
    }

    // Transfer to each seller
    for (const [sellerId, amount] of Object.entries(sellerAmounts)) {
      const seller = await prisma.sellers.findUnique({
        where: { id: sellerId },
      });

      if (seller?.stripeId) {
        try {
          await stripe.transfers.create({
            amount: Math.round(amount * 100), // cents
            currency: 'usd',
            destination: seller.stripeId,
            metadata: { orderId, sellerId },
          });
          console.log(`Transferred $${amount} to seller ${sellerId}`);
        } catch (err) {
          console.error(`Failed to transfer to seller ${sellerId}:`, err);
        }
      } else {
        console.warn(
          `Seller ${sellerId} has no Stripe account, skipping transfer`
        );
      }
    }
  } catch (error) {
    console.error('Error transferring to sellers:', error);
  }
}

// User: Get payment status (syncs from Stripe when still pending)
export const getPaymentStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        orders: { select: { id: true, orderNumber: true, status: true } },
      },
    });

    if (!payment) {
      return next(new NotFoundError('Payment not found'));
    }

    if (payment.userId !== user.id) {
      return next(new ValidationError('You can only view your own payments'));
    }

    // If still pending, check Stripe directly so the client doesn't depend on webhooks
    if (payment.status === 'pending') {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        payment.stripePaymentId
      );

      if (paymentIntent.status === 'succeeded') {
        // Atomic update — skip if webhook already processed it
        const updated = await prisma.payment.updateMany({
          where: { id, status: 'pending' },
          data: { status: 'succeeded' },
        });

        if (updated.count > 0) {
          const order = await prisma.order.findFirst({
            where: { paymentId: id },
          });
          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: { status: 'confirmed' },
            });
            await prisma.orderItem.updateMany({
              where: { orderId: order.id },
              data: { status: 'confirmed' },
            });
            publishPaymentEvent(PAYMENT_TOPICS.PAYMENT_SUCCEEDED, {
              id,
              orderId: order.id,
              stripePaymentId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
            });
            await transferToSellers(order.id);
          }
        }

        const refreshed = await prisma.payment.findUnique({
          where: { id },
          include: {
            orders: { select: { id: true, orderNumber: true, status: true } },
          },
        });
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return res.status(200).json({ success: true, payment: refreshed });
      }

      if (
        paymentIntent.status === 'canceled' ||
        paymentIntent.last_payment_error
      ) {
        await prisma.payment.updateMany({
          where: { id, status: 'pending' },
          data: { status: 'failed' },
        });
        publishPaymentEvent(PAYMENT_TOPICS.PAYMENT_FAILED, {
          stripePaymentId: paymentIntent.id,
        });
        const refreshed = await prisma.payment.findUnique({
          where: { id },
          include: {
            orders: { select: { id: true, orderNumber: true, status: true } },
          },
        });
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
        return res.status(200).json({ success: true, payment: refreshed });
      }
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return next(error);
  }
};

// Admin: List all payments
export const getAllPayments = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          orders: {
            select: { id: true, orderNumber: true, status: true, total: true },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

// Admin: Process refund
export const processRefund = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { orders: true },
    });

    if (!payment) {
      return next(new NotFoundError('Payment not found'));
    }

    if (payment.status !== 'succeeded') {
      return next(new ValidationError('Can only refund succeeded payments'));
    }

    // Create Stripe refund
    await stripe.refunds.create({
      payment_intent: payment.stripePaymentId,
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'refunded' },
    });

    // Update associated orders
    for (const order of payment.orders) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'refunded' },
      });

      // Restore stock
      const items = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    publishPaymentEvent(PAYMENT_TOPICS.PAYMENT_REFUNDED, {
      id: payment.id,
      stripePaymentId: payment.stripePaymentId,
      amount: payment.amount,
    });

    return res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    return next(error);
  }
};
