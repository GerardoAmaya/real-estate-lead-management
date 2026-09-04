import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes';
import { leadRoutes } from '../modules/leads/lead.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/leads', leadRoutes);
