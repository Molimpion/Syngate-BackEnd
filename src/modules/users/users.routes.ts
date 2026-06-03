import { Router } from 'express';
import { UsersController } from './users.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { validate } from '../../shared/middlewares/validate.middlewares';
import { 
  createUserSchema, 
  updateUserSchema, 
  linkCardSchema, 
  listUsersSchema 
} from '../../schemas/user.schema';
import { PapelUsuario } from '@prisma/client';

const router = Router();
const usersController = new UsersController();

router.use(authMiddleware);

router.get('/me', usersController.getProfile);

const adminRoles = [PapelUsuario.GESTOR, PapelUsuario.COORDENADOR];
router.use(roleMiddleware(adminRoles));

router.post('/', validate(createUserSchema), usersController.create);
router.get('/', validate(listUsersSchema), usersController.findAll);
router.get('/:id', usersController.findById);
router.put('/:id', validate(updateUserSchema), usersController.update);
router.delete('/:id', usersController.delete);
router.patch('/:id/cartao', validate(linkCardSchema), usersController.linkCard);

export { router as usersRouter };