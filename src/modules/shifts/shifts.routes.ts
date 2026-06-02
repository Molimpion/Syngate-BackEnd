import { Router } from 'express';
import { ShiftsController } from './shifts.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { validate } from '../../shared/middlewares/validate.middlewares';
import { createShiftSchema, updateShiftSchema } from '../../schemas/shift.schema';
import { PapelUsuario } from '@prisma/client';

const router = Router();
const shiftsController = new ShiftsController();

router.use(authMiddleware);

router.get('/', shiftsController.findAll);
router.get('/:id', shiftsController.findById);

const adminRoles = [PapelUsuario.GESTOR, PapelUsuario.COORDENADOR];

router.post('/', roleMiddleware(adminRoles), validate(createShiftSchema), shiftsController.create);
router.put('/:id', roleMiddleware(adminRoles), validate(updateShiftSchema), shiftsController.update);
router.delete('/:id', roleMiddleware(adminRoles), shiftsController.delete);

export { router as shiftsRouter };