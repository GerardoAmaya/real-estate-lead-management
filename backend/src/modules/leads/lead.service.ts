import type { QueryFilter, SortOrder, Types } from 'mongoose';
import { AppError } from '../../shared/errors/AppError';
import type { PaginatedResponse } from '../../shared/types/api';
import { LeadModel, type Lead } from './lead.model';
import type { CreateLeadInput, ListLeadsQuery, UpdateLeadStatusInput } from './lead.schema';

type LeanLead = Lead & { _id: Types.ObjectId };

// Forma publica del recurso: la API expone "id" y nunca "_id".
export type LeadResponse = Lead & { id: string };

// lean() no aplica transformaciones del esquema, asi que la conversion vive
// aqui: un unico lugar da forma a todas las respuestas de leads.
function serialize({ _id, ...rest }: LeanLead): LeadResponse {
  return { id: _id.toString(), ...rest };
}

// Solo se filtra por campos declarados: nada del query llega crudo a Mongo.
function buildFilter(query: ListLeadsQuery): QueryFilter<Lead> {
  const filter: QueryFilter<Lead> = {};
  if (query.status) filter.status = query.status;
  if (query.source) filter.source = query.source;
  if (query.project) filter.project = query.project;
  return filter;
}

export async function listLeads(query: ListLeadsQuery): Promise<PaginatedResponse<LeadResponse>> {
  const filter = buildFilter(query);
  const sort: Record<string, SortOrder> = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };
  const skip = (query.page - 1) * query.limit;

  // Conteo y pagina se resuelven en paralelo para no encadenar dos viajes.
  const [items, total] = await Promise.all([
    LeadModel.find(filter).sort(sort).skip(skip).limit(query.limit).lean<LeanLead[]>().exec(),
    LeadModel.countDocuments(filter).exec(),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

  return {
    data: items.map(serialize),
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

export async function getLeadById(id: string): Promise<LeadResponse> {
  const lead = await LeadModel.findById(id).lean<LeanLead>().exec();
  if (!lead) throw AppError.notFound(`No existe un lead con el identificador ${id}`);
  return serialize(lead);
}

export async function createLead(input: CreateLeadInput): Promise<LeadResponse> {
  const created = await LeadModel.create(input);
  return serialize(created.toObject<LeanLead>());
}

export async function updateLeadStatus(
  id: string,
  input: UpdateLeadStatusInput,
): Promise<LeadResponse> {
  // Solo se actualiza el estado: el resto del documento queda intacto.
  const updated = await LeadModel.findByIdAndUpdate(
    id,
    { $set: { status: input.status } },
    { returnDocument: 'after', runValidators: true },
  )
    .lean<LeanLead>()
    .exec();

  if (!updated) throw AppError.notFound(`No existe un lead con el identificador ${id}`);
  return serialize(updated);
}
