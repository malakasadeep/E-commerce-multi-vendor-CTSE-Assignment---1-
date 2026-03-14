import express, { Router } from 'express';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isUser, isAdmin } from '@packages/middleware/autherizeRoles';
import {
  createOrderReview,
  getSellerReviews,
  getOrderReview,
  getAllReviews,
  deleteReview,
} from '../controller/review.controller';

const router: Router = express.Router();

// User routes
router.post('/orders/:orderId/review', isAuthenticated, isUser, createOrderReview);
router.get('/orders/:orderId/review', isAuthenticated, isUser, getOrderReview);

// Public routes
router.get('/seller/:sellerId/reviews', getSellerReviews);

// Admin routes
router.get('/admin/reviews', isAuthenticated, isAdmin, getAllReviews);
router.delete('/admin/reviews/:id', isAuthenticated, isAdmin, deleteReview);

export default router;
