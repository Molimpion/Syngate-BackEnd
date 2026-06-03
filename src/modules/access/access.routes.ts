import { Router } from 'express';
import { AccessController } from './access.controller';
import { deviceMiddleware } from '../../shared/middlewares/device.middleware';
import { validate } from '../../shared/middlewares/validate.middlewares';
import { accessLogSchema } from '../../schemas/access-log.schema';

const router = Router();
const accessController = new AccessController();

// Endpoint de acesso exclusivo das placas (protegido por hardware keys)
router.post(
  '/',
  deviceMiddleware,
  validate(accessLogSchema),
  accessController.process
);

export { router as accessRouter };