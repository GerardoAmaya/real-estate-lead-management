import type { RequestHandler } from 'express';
import { validatedQuery } from '../../middlewares/validate';
import { objectIdParam } from '../../middlewares/validate-object-id';
import type { ListLeadsQuery } from './lead.schema';
import * as leadService from './lead.service';

export const listLeads: RequestHandler = async (req, res) => {
  const query = validatedQuery<ListLeadsQuery>(req);
  res.json(await leadService.listLeads(query));
};

export const getLeadById: RequestHandler = async (req, res) => {
  res.json(await leadService.getLeadById(objectIdParam(req)));
};

export const createLead: RequestHandler = async (req, res) => {
  const input = req.body as Parameters<typeof leadService.createLead>[0];
  res.status(201).json(await leadService.createLead(input));
};

export const updateLeadStatus: RequestHandler = async (req, res) => {
  const input = req.body as Parameters<typeof leadService.updateLeadStatus>[1];
  res.json(await leadService.updateLeadStatus(objectIdParam(req), input));
};
