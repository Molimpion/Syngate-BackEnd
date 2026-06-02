import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.log) {
    req.log.error({ err, msg: err.message });
  } else {
    console.error('[Unhandled Error]', err);
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor.',
    ...( !isProduction && { details: err.message, stack: err.stack } )
  });
};