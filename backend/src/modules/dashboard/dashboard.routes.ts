import { Router } from 'express';
import { getSummary } from './dashboard.controller';

export const dashboardRoutes = Router();

dashboardRoutes.get('/summary', getSummary);
