import { NextFunction, Response } from 'express';
import prisma from '@packages/libs/prisma';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '@packages/error-handler';
import { publishOrderEvent } from '../utils/kafka.producer';
import { ORDER_TOPICS } from '@packages/libs/kafka';
import { generateOrderNumber } from '../utils/orderNumber';

const PLATFORM_FEE_RATE = 0.2; // 20% service fee

// User: Place order
export const placeOrder = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new ValidationError('Order must contain at least one item'));
    }

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country
    ) {
      return next(
        new ValidationError(
          'Shipping address is required (street, city, country)'
        )
      );
    }

    // Validate products and check stock
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true, shop: true },
    });

    if (products.length !== productIds.length) {
      return next(new ValidationError('One or more products not found'));
    }

    // Build order items with fee calculation
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return next(new ValidationError(`Product ${item.productId} not found`));
      }

      if (product.stock < item.quantity) {
        return next(
          new ValidationError(
            `Insufficient stock for "${product.name}". Available: ${product.stock}`
          )
        );
      }

      const itemPrice =
        product.discountPrice && product.discountPrice < product.price
          ? product.discountPrice
          : product.price;
      const itemTotal = itemPrice * item.quantity;
      const sellerAmount = itemTotal * (1 - PLATFORM_FEE_RATE);
      const platformFee = itemTotal * PLATFORM_FEE_RATE;

      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        sellerId: product.sellerId,
        shopId: product.shopId,
        productName: product.name,
        productImage: product.images[0]?.url || null,
        price: itemPrice,
        quantity: item.quantity,
        sellerAmount: Math.round(sellerAmount * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
      });
    }

    const serviceFee = Math.round(subtotal * PLATFORM_FEE_RATE * 100) / 100;
    const total = Math.round((subtotal + serviceFee) * 100) / 100;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        subtotal: Math.round(subtotal * 100) / 100,
        serviceFee,
        total,
        status: 'pending',
        shippingAddress,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Decrement stock for each product
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Publish Kafka event
    publishOrderEvent(ORDER_TOPICS.ORDER_PLACED, {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: user.id,
      total: order.total,
      items: order.items,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    return next(error);
  }
};

// User: Get own orders
export const getUserOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
            },
          },
          payment: true,
        },
      }),
      prisma.order.count({ where: { userId: user.id } }),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

// User: Get order detail
export const getOrderDetail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { images: true, shop: true } },
          },
        },
        payment: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    if (order.userId !== user.id) {
      return next(new ForbiddenError('You can only view your own orders'));
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return next(error);
  }
};

// Seller: Get orders containing seller's items
export const getSellerOrders = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: any = { sellerId: seller.id };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.orderItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          product: { include: { images: true } },
        },
      }),
      prisma.orderItem.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      orderItems: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

// Seller: Update order item status
export const updateOrderItemStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const { id, itemId } = req.params;
    const { status } = req.body;

    const validStatuses = ['processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return next(
        new ValidationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        )
      );
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!orderItem) {
      return next(new NotFoundError('Order item not found'));
    }

    if (orderItem.orderId !== id) {
      return next(
        new ValidationError('Order item does not belong to this order')
      );
    }

    if (orderItem.sellerId !== seller.id) {
      return next(
        new ForbiddenError('You can only update your own order items')
      );
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        order: true,
        product: { include: { images: true } },
      },
    });

    // If item is delivered, increment sold_out count
    if (status === 'delivered') {
      await prisma.product.update({
        where: { id: orderItem.productId },
        data: { sold_out: { increment: orderItem.quantity } },
      });
    }

    // Check if all items in the order have the same status
    const allItems = await prisma.orderItem.findMany({
      where: { orderId: id },
    });

    const allShipped = allItems.every(
      item => item.status === 'shipped' || item.status === 'delivered'
    );
    const allDelivered = allItems.every(item => item.status === 'delivered');

    if (allDelivered) {
      await prisma.order.update({
        where: { id },
        data: { status: 'delivered' },
      });
      publishOrderEvent(ORDER_TOPICS.ORDER_DELIVERED, {
        id,
        orderNumber: orderItem.order.orderNumber,
      });
    } else if (allShipped) {
      await prisma.order.update({
        where: { id },
        data: { status: 'shipped' },
      });
      publishOrderEvent(ORDER_TOPICS.ORDER_SHIPPED, {
        id,
        orderNumber: orderItem.order.orderNumber,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order item status updated to ${status}`,
      orderItem: updatedItem,
    });
  } catch (error) {
    return next(error);
  }
};

// Admin: Get all orders
export const getAllOrders = async (
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

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
            },
          },
          user: { select: { id: true, name: true, email: true } },
          payment: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

// Admin: Get order detail
export const getAdminOrderDetail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { images: true, shop: true } },
          },
        },
        user: { select: { id: true, name: true, email: true } },
        payment: true,
      },
    });

    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return next(error);
  }
};

// Admin: Update order status
export const updateOrderStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
    ];
    if (!validStatuses.includes(status)) {
      return next(
        new ValidationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        )
      );
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return next(new NotFoundError('Order not found'));
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // If cancelled, restore stock
    if (status === 'cancelled') {
      for (const item of updatedOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      publishOrderEvent(ORDER_TOPICS.ORDER_CANCELLED, {
        id: order.id,
        orderNumber: order.orderNumber,
        paymentId: order.paymentId,
      });
    }

    if (status === 'confirmed') {
      publishOrderEvent(ORDER_TOPICS.ORDER_CONFIRMED, {
        id: order.id,
        orderNumber: order.orderNumber,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

// Admin: Revenue dashboard data
export const getRevenue = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const period = (req.query.period as string) || 'all';

    let dateFilter: any = {};
    const now = new Date();
    if (period === 'today') {
      dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { gte: monthAgo };
    }

    const where: any = {
      status: { notIn: ['cancelled', 'refunded'] },
    };
    if (dateFilter.gte) {
      where.createdAt = dateFilter;
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        subtotal: true,
        serviceFee: true,
        total: true,
        createdAt: true,
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalPlatformFees = orders.reduce((sum, o) => sum + o.serviceFee, 0);
    const totalSellerPayouts = orders.reduce((sum, o) => sum + o.subtotal, 0);

    // Group by date for chart
    const revenueByDate: Record<
      string,
      { total: number; platformFee: number; sellerPayout: number }
    > = {};
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      if (!revenueByDate[dateKey]) {
        revenueByDate[dateKey] = { total: 0, platformFee: 0, sellerPayout: 0 };
      }
      revenueByDate[dateKey].total += order.total;
      revenueByDate[dateKey].platformFee += order.serviceFee;
      revenueByDate[dateKey].sellerPayout += order.subtotal;
    });

    const chartData = Object.entries(revenueByDate)
      .map(([date, data]) => ({
        date,
        total: Math.round(data.total * 100) / 100,
        platformFee: Math.round(data.platformFee * 100) / 100,
        sellerPayout: Math.round(data.sellerPayout * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({
      success: true,
      revenue: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalPlatformFees: Math.round(totalPlatformFees * 100) / 100,
        totalSellerPayouts: Math.round(totalSellerPayouts * 100) / 100,
        orderCount: orders.length,
        chartData,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Admin: Dashboard stats
export const getStats = async (req: any, res: Response, next: NextFunction) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalUsers,
      totalSellers,
      totalProducts,
      revenueData,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.user.count(),
      prisma.sellers.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        where: { status: { notIn: ['cancelled', 'refunded'] } },
        _sum: { total: true, serviceFee: true },
      }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalUsers,
        totalSellers,
        totalProducts,
        totalRevenue: revenueData._sum.total || 0,
        totalPlatformFees: revenueData._sum.serviceFee || 0,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Seller: Get revenue stats
export const getSellerRevenue = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;

    const items = await prisma.orderItem.findMany({
      where: {
        sellerId: seller.id,
        status: { notIn: ['cancelled'] },
      },
      include: {
        order: { select: { createdAt: true, status: true } },
      },
    });

    const totalSales = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalEarned = items.reduce((sum, item) => sum + item.sellerAmount, 0);
    const totalPlatformFee = items.reduce(
      (sum, item) => sum + item.platformFee,
      0
    );
    const totalItemsSold = items.reduce((sum, item) => sum + item.quantity, 0);

    // Group by date
    const salesByDate: Record<string, { sales: number; earned: number }> = {};
    items.forEach(item => {
      const dateKey = item.order.createdAt.toISOString().slice(0, 10);
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = { sales: 0, earned: 0 };
      }
      salesByDate[dateKey].sales += item.price * item.quantity;
      salesByDate[dateKey].earned += item.sellerAmount;
    });

    const chartData = Object.entries(salesByDate)
      .map(([date, data]) => ({
        date,
        sales: Math.round(data.sales * 100) / 100,
        earned: Math.round(data.earned * 100) / 100,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({
      success: true,
      revenue: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalEarned: Math.round(totalEarned * 100) / 100,
        totalPlatformFee: Math.round(totalPlatformFee * 100) / 100,
        totalItemsSold,
        totalOrders: items.length,
        chartData,
      },
    });
  } catch (error) {
    return next(error);
  }
};
