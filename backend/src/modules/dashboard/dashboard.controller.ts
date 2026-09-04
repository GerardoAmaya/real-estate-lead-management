import type { RequestHandler } from 'express';
import { getDashboardSummary } from './dashboard.service';

export const getSummary: RequestHandler = async (_req, res) => {
  res.json(await getDashboardSummary());
};
