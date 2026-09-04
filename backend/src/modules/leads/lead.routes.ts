import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import { validateObjectId } from '../../middlewares/validate-object-id';
import { authenticate } from '../../middlewares/authenticate';
import * as controller from './lead.controller';
import { createLeadSchema, listLeadsQuerySchema, updateLeadStatusSchema } from './lead.schema';

export const leadRoutes = Router();

// Lecturas publicas; las escrituras requieren token.
leadRoutes.get('/', validate({ query: listLeadsQuerySchema }), controller.listLeads);

leadRoutes.get('/:id', validateObjectId(), controller.getLeadById);

leadRoutes.post('/', authenticate, validate({ body: createLeadSchema }), controller.createLead);

leadRoutes.patch(
  '/:id/status',
  authenticate,
  validateObjectId(),
  validate({ body: updateLeadStatusSchema }),
  controller.updateLeadStatus,
);
