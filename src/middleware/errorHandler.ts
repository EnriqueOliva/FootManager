import { Request, Response, NextFunction } from 'express';
import customError from '../utils/customError';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = null;

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    details = err.details;
  } else if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Error';
    details = err.errors;
  } else if (err.isAxiosError) {
    statusCode = 502;
    message = 'External Service Error';
    details = err.response ? err.response.data : 'No response from external service';
  } else if (err.status) {
    statusCode = err.status;
    message = err.message;
    details = err.details || null;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({ error: message, details });
};

export default errorHandler;