import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: 'Not Found',
      details: `${req.method} ${req.path} not found`
    }
  });
}
