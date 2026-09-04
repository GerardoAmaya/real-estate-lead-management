import { Router } from 'express';
import { validate } from '../../middlewares/validate';
import * as controller from './lead.controller';
import {
  createLeadSchema,
  leadIdParamSchema,
  listLeadsQuerySchema,
  updateLeadStatusSchema,
} from './lead.schema';

export const leadRoutes = Router();

leadRoutes.get('/', validate({ query: listLeadsQuerySchema }), controller.listLeads);

leadRoutes.get('/:id', validate({ params: leadIdParamSchema }), controller.getLeadById);

leadRoutes.post('/', validate({ body: createLeadSchema }), controller.createLead);

leadRoutes.patch(
  '/:id/status',
  validate({ params: leadIdParamSchema, body: updateLeadStatusSchema }),
  controller.updateLeadStatus,
);
