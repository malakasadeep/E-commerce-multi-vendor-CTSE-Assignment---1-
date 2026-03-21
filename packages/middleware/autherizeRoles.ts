import { UnauthorizedError } from '@packages/error-handler';
import { NextFunction, Response } from 'express';

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'seller') {
    return next(
      new UnauthorizedError(
        'You are not authorized to perform this action: Not a seller'
      )
    );
  }
  return next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'user') {
    return next(
      new UnauthorizedError(
        'You are not authorized to perform this action: Not a user'
      )
    );
  }
  return next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') {
    return next(
      new UnauthorizedError(
        'You are not authorized to perform this action: Not an admin'
      )
    );
  }
  return next();
};
