import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import customError from '../utils/customError';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new customError('Validation Error', 400, errors.array()));
  }
  next();
};

export default validateRequest;
