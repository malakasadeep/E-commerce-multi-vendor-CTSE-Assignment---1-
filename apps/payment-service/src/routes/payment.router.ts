import express, { Router } from 'express';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isUser, isAdmin } from '@packages/middleware/autherizeRoles';
import {
  createPaymentIntent,
  handleWebhook,
  getPaymentStatus,
  syncPayment,
  getAllPayments,
  processRefund,
} from '../controller/payment.controller';

const router: Router = express.Router();

// User routes
router.post(
  '/create-payment-intent',
  isAuthenticated,
  isUser,
  createPaymentIntent
);
router.get('/payments/:id', isAuthenticated, isUser, getPaymentStatus);
router.post('/payments/:id/sync', isAuthenticated, isUser, syncPayment);

// Admin routes
router.get('/admin/payments', isAuthenticated, isAdmin, getAllPayments);
router.post(
  '/admin/refund/:paymentId',
  isAuthenticated,
  isAdmin,
  processRefund
);

// Webhook router (separate - uses raw body)
const webhookRouter: Router = express.Router();
webhookRouter.post('/', handleWebhook);

export { webhookRouter };
export default router;
