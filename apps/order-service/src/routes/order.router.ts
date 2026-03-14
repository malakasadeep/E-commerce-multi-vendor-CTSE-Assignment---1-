import express, { Router } from 'express';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isUser, isSeller, isAdmin } from '@packages/middleware/autherizeRoles';
import {
  placeOrder,
  getUserOrders,
  getOrderDetail,
  getSellerOrders,
  updateOrderItemStatus,
  getAllOrders,
  getAdminOrderDetail,
  updateOrderStatus,
  getRevenue,
  getStats,
  getSellerRevenue,
} from '../controller/order.controller';

const router: Router = express.Router();

// User routes
router.post('/orders', isAuthenticated, isUser, placeOrder);
router.get('/orders', isAuthenticated, isUser, getUserOrders);
router.get('/orders/:id', isAuthenticated, isUser, getOrderDetail);

// Seller routes
router.get('/seller/orders', isAuthenticated, isSeller, getSellerOrders);
router.put('/seller/orders/:id/items/:itemId/status', isAuthenticated, isSeller, updateOrderItemStatus);
router.get('/seller/revenue', isAuthenticated, isSeller, getSellerRevenue);

// Admin routes
router.get('/admin/orders', isAuthenticated, isAdmin, getAllOrders);
router.get('/admin/orders/:id', isAuthenticated, isAdmin, getAdminOrderDetail);
router.put('/admin/orders/:id/status', isAuthenticated, isAdmin, updateOrderStatus);
router.get('/admin/revenue', isAuthenticated, isAdmin, getRevenue);
router.get('/admin/stats', isAuthenticated, isAdmin, getStats);

export default router;
