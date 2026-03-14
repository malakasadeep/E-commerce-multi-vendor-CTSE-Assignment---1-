import express, { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getSellerProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductsByCategory,
  searchProducts,
} from '../controller/product.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller, isUser } from '@packages/middleware/autherizeRoles';

const router: Router = express.Router();

// Public routes
router.get('/products', getAllProducts);
router.get('/products/search', searchProducts);
router.get('/products/category/:category', getProductsByCategory);
router.get('/products/:id', getProductById);

// Seller-only routes (authenticated + seller role)
router.post('/products', isAuthenticated, isSeller, createProduct);
router.get('/seller/products', isAuthenticated, isSeller, getSellerProducts);
router.put('/products/:id', isAuthenticated, isSeller, updateProduct);
router.delete('/products/:id', isAuthenticated, isSeller, deleteProduct);

// User routes (authenticated + user role)
router.post('/products/:id/reviews', isAuthenticated, isUser, createProductReview);

export default router;
