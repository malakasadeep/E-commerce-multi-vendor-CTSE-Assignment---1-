import { NextFunction, Response } from 'express';
import prisma from '@packages/libs/prisma';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '@packages/error-handler';
import { publishProductEvent } from '../utils/kafka.producer';
import { PRODUCT_TOPICS } from '@packages/libs/kafka';

export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      tags,
      stock,
      images,
    } = req.body;

    if (!name || !description || !price || !category) {
      return next(new ValidationError('Name, description, price, and category are required'));
    }

    const seller = req.seller;
    if (!seller) {
      return next(new ValidationError('Seller not found'));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId: seller.id },
    });

    if (!shop) {
      return next(new ValidationError('You must create a shop before adding products'));
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        category,
        tags: tags || [],
        stock: stock ? parseInt(stock) : 0,
        sellerId: seller.id,
        shopId: shop.id,
        images: {
          create: (images || []).map((img: { url: string }) => ({
            url: img.url,
          })),
        },
      },
      include: {
        images: true,
        shop: true,
      },
    });

    // Fire-and-forget Kafka event
    publishProductEvent(PRODUCT_TOPICS.PRODUCT_CREATED, product);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.product.count(),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: seller.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.product.count({ where: { sellerId: seller.id } }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductById = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        shop: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const seller = req.seller;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      return next(new NotFoundError('Product not found'));
    }

    if (existingProduct.sellerId !== seller.id) {
      return next(new ForbiddenError('You can only update your own products'));
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      tags,
      stock,
      images,
    } = req.body;

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined)
      updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (stock !== undefined) updateData.stock = parseInt(stock);

    // Handle images: delete old ones and create new ones if provided
    if (images !== undefined) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
      updateData.images = {
        create: images.map((img: { url: string }) => ({
          url: img.url,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        shop: true,
      },
    });

    // Fire-and-forget Kafka event
    publishProductEvent(PRODUCT_TOPICS.PRODUCT_UPDATED, product);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const seller = req.seller;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    if (product.sellerId !== seller.id) {
      return next(new ForbiddenError('You can only delete your own products'));
    }

    await prisma.product.delete({
      where: { id },
    });

    // Fire-and-forget Kafka event
    publishProductEvent(PRODUCT_TOPICS.PRODUCT_DELETED, { id, sellerId: seller.id });

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const createProductReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    if (!rating || !comment) {
      return next(new ValidationError('Rating and comment are required'));
    }

    if (rating < 1 || rating > 5) {
      return next(new ValidationError('Rating must be between 1 and 5'));
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { reviews: true },
    });

    if (!product) {
      return next(new NotFoundError('Product not found'));
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      (r) => r.userId === user.id
    );
    if (existingReview) {
      return next(new ValidationError('You have already reviewed this product'));
    }

    const review = await prisma.productReview.create({
      data: {
        userId: user.id,
        productId: id,
        rating: parseFloat(rating),
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculate average rating
    const allReviews = await prisma.productReview.findMany({
      where: { productId: id },
    });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id },
      data: { ratings: avgRating },
    });

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductsByCategory = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { category },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.product.count({ where: { category } }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const searchProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const q = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { description: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          shop: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};
