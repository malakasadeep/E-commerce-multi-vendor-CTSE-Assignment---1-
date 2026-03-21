import { NextFunction, Response } from 'express';
import prisma from '@packages/libs/prisma';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '@packages/error-handler';
import { publishReviewEvent } from '../utils/kafka.producer';
import { REVIEW_TOPICS } from '@packages/libs/kafka';

// User: Submit order review (after delivery)
export const createOrderReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { orderId } = req.params;
    const { rating, comment, sellerId } = req.body;

    if (!rating || !comment || !sellerId) {
      return next(
        new ValidationError('Rating, comment, and sellerId are required')
      );
    }

    if (rating < 1 || rating > 5) {
      return next(new ValidationError('Rating must be between 1 and 5'));
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    if (order.userId !== user.id) {
      return next(new ForbiddenError('You can only review your own orders'));
    }

    if (order.status !== 'delivered') {
      return next(new ValidationError('You can only review delivered orders'));
    }

    // Check if user already reviewed this order for this seller
    const existingReview = await prisma.orderReview.findFirst({
      where: { orderId, userId: user.id, sellerId },
    });

    if (existingReview) {
      return next(
        new ValidationError(
          'You have already reviewed this seller for this order'
        )
      );
    }

    // Verify seller has items in this order
    const sellerItems = order.items.filter(item => item.sellerId === sellerId);
    if (sellerItems.length === 0) {
      return next(
        new ValidationError('This seller has no items in this order')
      );
    }

    const review = await prisma.orderReview.create({
      data: {
        userId: user.id,
        orderId,
        sellerId,
        rating: parseFloat(rating),
        comment,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    publishReviewEvent(REVIEW_TOPICS.REVIEW_CREATED, {
      id: review.id,
      sellerId,
      rating: review.rating,
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    return next(error);
  }
};

// Public: Get all reviews for a seller
export const getSellerReviews = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.orderReview.findMany({
        where: { sellerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.orderReview.count({ where: { sellerId } }),
    ]);

    // Calculate average rating
    const avgResult = await prisma.orderReview.aggregate({
      where: { sellerId },
      _avg: { rating: true },
      _count: true,
    });

    return res.status(200).json({
      success: true,
      reviews,
      averageRating: avgResult._avg.rating || 0,
      totalReviews: avgResult._count,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

// User: Get own review for an order
export const getOrderReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { orderId } = req.params;

    const reviews = await prisma.orderReview.findMany({
      where: { orderId, userId: user.id },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    return next(error);
  }
};

// Admin: List all reviews
export const getAllReviews = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Include both order reviews and product reviews
    const [orderReviews, orderReviewTotal, productReviews, productReviewTotal] =
      await Promise.all([
        prisma.orderReview.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.orderReview.count(),
        prisma.productReview.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true } },
            product: { select: { id: true, name: true } },
          },
        }),
        prisma.productReview.count(),
      ]);

    return res.status(200).json({
      success: true,
      orderReviews,
      productReviews,
      pagination: {
        orderReviewTotal,
        productReviewTotal,
        page,
        limit,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Admin: Delete review
export const deleteReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'order' or 'product'

    if (type === 'product') {
      const review = await prisma.productReview.findUnique({ where: { id } });
      if (!review) {
        return next(new NotFoundError('Product review not found'));
      }
      await prisma.productReview.delete({ where: { id } });

      // Recalculate product average rating
      const allReviews = await prisma.productReview.findMany({
        where: { productId: review.productId },
      });
      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;
      await prisma.product.update({
        where: { id: review.productId },
        data: { ratings: avgRating },
      });

      publishReviewEvent(REVIEW_TOPICS.REVIEW_DELETED, { id, type: 'product' });
    } else {
      const review = await prisma.orderReview.findUnique({ where: { id } });
      if (!review) {
        return next(new NotFoundError('Order review not found'));
      }
      await prisma.orderReview.delete({ where: { id } });
      publishReviewEvent(REVIEW_TOPICS.REVIEW_DELETED, { id, type: 'order' });
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};
