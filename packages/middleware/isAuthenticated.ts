import prisma from '@packages/libs/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET is required');
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const tryVerify = (token: string | undefined) => {
  if (!token) return null;
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      id: string;
      role: 'user' | 'seller' | 'admin';
    };
  } catch {
    return null;
  }
};

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    // Each named cookie is only trusted when its decoded role matches the cookie's purpose,
    // preventing a stale user accessToken from shadowing a sellerAccessToken (or vice versa).
    const sellerDecoded = tryVerify(req.cookies['sellerAccessToken']);
    const adminDecoded = tryVerify(req.cookies['adminAccessToken']);
    const userDecoded = tryVerify(req.cookies['accessToken']);
    const headerDecoded = tryVerify(req.headers.authorization?.split(' ')[1]);

    const decoded =
      (sellerDecoded?.role === 'seller' ? sellerDecoded : null) ||
      (adminDecoded?.role === 'admin' ? adminDecoded : null) ||
      (userDecoded?.role === 'user' ? userDecoded : null) ||
      headerDecoded;

    if (!decoded || !decoded.id || !decoded.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    let account;
    if (decoded.role === 'user') {
      account = await prisma.user.findUnique({ where: { id: decoded.id } });
      req.user = account;
    } else if (decoded.role === 'seller') {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account;
    } else if (decoded.role === 'admin') {
      account = await prisma.admin.findUnique({ where: { id: decoded.id } });
      req.admin = account;
    }

    if (!account) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.role = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export default isAuthenticated;
