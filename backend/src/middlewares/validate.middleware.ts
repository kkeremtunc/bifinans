import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => issue.message).join(', ');
        res.status(400).json({
          success: false,
          message: `Doğrulama hatası: ${issues}`,
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
};
