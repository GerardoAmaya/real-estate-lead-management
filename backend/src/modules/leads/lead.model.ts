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
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        return ret;
      },
    },
  },
);

// Indices alineados con los filtros del enunciado. Los compuestos anteponen
// el campo filtrado y cierran con el de ordenamiento (patron ESR).
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ source: 1, createdAt: -1 });
leadSchema.index({ project: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ budget: -1 });
leadSchema.index({ email: 1 });

export type Lead = InferSchemaType<typeof leadSchema>;
export type LeadDocument = HydratedDocument<Lead>;

export const LeadModel = model('Lead', leadSchema);
