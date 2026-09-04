import type { QueryFilter, SortOrder } from 'mongoose';
import { AppError } from '../../shared/errors/AppError';
import type { PaginatedResponse } from '../../shared/types/api';
import { LeadModel, type Lead } from './lead.model';
import type {
  CreateLeadInput,
  ListLeadsQuery,
  UpdateLeadStatusInput,
} from './lead.schema';

// Solo se filtra por campos declarados: nada del query llega crudo a Mongo.
function buildFilter(query: ListLeadsQuery): QueryFilter<Lead> {
  const filter: QueryFilter<Lead> = {};
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.project) filter.project = query.project;
  return filter;
}

export async function listLeads(query: ListLeadsQuery): Promise<PaginatedResponse<Lead>> {
  const filter = buildFilter(query);
  const sort: Record<string, SortOrder> = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  const skip = (query.page - 1) * query.limit;

  // Conteo y pagina se resuelven en paralelo para no encadenar dos viajes.
  const [items, total] = await Promise.all([
    LeadModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean<Lead[]>().exec(),
    LeadModel.countDocuments(filter).exec(),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

  return {
    data: items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    },
  };
}

export async function getLeadById(id: string): Promise<Lead> {
  const lead = await LeadModel.findById(id).lean<Lead>().exec();
  if (!lead) throw AppError.notFound(`No existe un lead con el identificador ${id}`);
  return lead;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const created = await LeadModel.create(input);
  return created.toJSON();
}

export async function updateLeadStatus(id: string, input: UpdateLeadStatusInput): Promise<Lead> {
  // Solo se actualiza el estado: el resto del documento queda intacto.
  const updated = await LeadModel.findByIdAndUpdate(
    id,
    { $set: { status: input.status } },
    { returnDocument: 'after', runValidators: true },
  )
    .lean<Lead>()
    .exec();

  if (!updated) throw AppError.notFound(`No existe un lead con el identificador ${id}`);
  return updated;
}
