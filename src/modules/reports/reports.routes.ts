import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authMiddleware } from '../../shared/middlewares/auth.middleware';
import { roleMiddleware } from '../../shared/middlewares/role.middleware';
import { PapelUsuario } from '@prisma/client';

const router = Router();
const reportsController = new ReportsController();

router.use(authMiddleware);

const adminRoles = [PapelUsuario.GESTOR, PapelUsuario.COORDENADOR];
router.use(roleMiddleware(adminRoles));

router.get('/stats', reportsController.getStats);
router.get('/dashboard', reportsController.getDashboardData);
router.get('/export/csv', reportsController.downloadCSV);

export { router as reportsRouter };