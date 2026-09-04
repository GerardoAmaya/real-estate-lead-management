import type { RequestHandler } from 'express';
import { validatedParams, validatedQuery } from '../../middlewares/validate';
import type { LeadIdParam, ListLeadsQuery } from './lead.schema';
import * as leadService from './lead.service';

export const listLeads: RequestHandler = async (req, res) => {
  const query = validatedQuery<ListLeadsQuery>(req);
  res.json(await leadService.listLeads(query));
};

export const getLeadById: RequestHandler = async (req, res) => {
  const { id } = validatedParams<LeadIdParam>(req);
  res.json(await leadService.getLeadById(id));
};

export const createLead: RequestHandler = async (req, res) => {
  const created = await leadService.createLead(req.body as Parameters<typeof leadService.createLead>[0]);
  res.status(201).json(created);
};

export const updateLeadStatus: RequestHandler = async (req, res) => {
  const { id } = validatedParams<LeadIdParam>(req);
  const body = req.body as Parameters<typeof leadService.updateLeadStatus>[1];
  res.json(await leadService.updateLeadStatus(id, body));
};
