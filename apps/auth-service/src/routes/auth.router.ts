import express, { Router } from 'express';
import {
  createShop,
  createStripeLink,
  getAdmin,
  getSeller,
  getUser,
  login,
  loginAdmin,
  loginSeller,
  logoutAdmin,
  refreshToken,
  registerSeller,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifySeller,
  verifyUser,
  veryfyUserForgotPassword,
} from '../controller/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isAdmin, isSeller } from '@packages/middleware/autherizeRoles';

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', login);
router.post('/refresh-tocken', refreshToken);
router.get('/logged-in-user', isAuthenticated, getUser);
router.post('/forgot-password-user', userForgotPassword);
router.post('/verify-forgot-password-user', veryfyUserForgotPassword);
router.post('/reset-password-user', resetUserPassword);
router.post('/seller-registration', registerSeller);
router.post('/verify-seller', verifySeller);
router.post('/create-shop', createShop);
router.post('/create-stripe-link', createStripeLink);
router.post('/login-seller', loginSeller);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);

// Admin routes
router.post('/login-admin', loginAdmin);
router.get('/logged-in-admin', isAuthenticated, isAdmin, getAdmin);
router.post('/logout-admin', logoutAdmin);

export default router;
