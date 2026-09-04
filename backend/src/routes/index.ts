import { Router } from 'express';
import { healthRoutes } from '../modules/health/health.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
