import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { LEAD_SOURCES, LEAD_STATUSES } from './lead.constants';

const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 30 },
    source: { type: String, required: true, enum: LEAD_SOURCES },
    status: { type: String, required: true, enum: LEAD_STATUSES, default: 'Nuevo' },
    budget: { type: Number, required: true, min: 1 },
    project: { type: String, required: true, trim: true, maxlength: 120 },
  },
  // La forma publica del recurso la define serialize() en lead.service.ts:
  // con lean() el transform de toJSON no se ejecutaria y habria dos formas.
  { timestamps: true, versionKey: false },
);

// Los indices NO se declaran aqui: viven en migrations/*-create-leads-indexes.js
// para tener una sola fuente de verdad y control explicito sobre su creacion.

export type Lead = InferSchemaType<typeof leadSchema>;
export type LeadDocument = HydratedDocument<Lead>;

export const LeadModel = model('Lead', leadSchema);
