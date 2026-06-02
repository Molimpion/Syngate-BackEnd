import { Router } from 'express';
import { DevicesController } from './devices.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { validate } from '../../shared/middlewares/validate.middlewares';
import { createDeviceSchema, updateDeviceSchema } from '../../schemas/device.schema';
import { PapelUsuario } from '@prisma/client';

const router = Router();
const devicesController = new DevicesController();

// Apenas GESTOR e COORDENADOR podem visualizar e manipular os dispositivos IoT
const adminRoles = [PapelUsuario.GESTOR, PapelUsuario.COORDENADOR];

router.use(authMiddleware);
router.use(roleMiddleware(adminRoles));

router.post('/', validate(createDeviceSchema), devicesController.create);
router.get('/', devicesController.findAll);
router.get('/:id', devicesController.findById);
router.put('/:id', validate(updateDeviceSchema), devicesController.update);
router.delete('/:id', devicesController.delete);

export { router as devicesRouter };