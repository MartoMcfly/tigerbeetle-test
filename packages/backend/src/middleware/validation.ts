import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from './error-handler';

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new AppError(400, `Validation error: ${messages}`);
      }
      next(error);
    }
  };
}

