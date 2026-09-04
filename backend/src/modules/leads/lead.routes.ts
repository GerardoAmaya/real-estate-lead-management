import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/authenticate';
import * as controller from './lead.controller';
import {
  createLeadSchema,
  leadIdParamSchema,
  listLeadsQuerySchema,
  updateLeadStatusSchema,
} from './lead.schema';

export const leadRoutes = Router();

// Lecturas publicas; las escrituras requieren token.
leadRoutes.get('/', validate({ query: listLeadsQuerySchema }), controller.listLeads);

leadRoutes.get('/:id', validate({ params: leadIdParamSchema }), controller.getLeadById);

leadRoutes.post(
  '/',
  authenticate,
  validate({ body: createLeadSchema }),
  controller.createLead,
);

leadRoutes.patch(
  '/:id/status',
  authenticate,
  validate({ params: leadIdParamSchema, body: updateLeadStatusSchema }),
  controller.updateLeadStatus,
);
