import { Router } from 'express';
import { healthCheck } from './health.controller';

export const healthRoutes = Router();

healthRoutes.get('/', healthCheck);
