import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';
import { USER_ROLES } from './user.constants';

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
    // select: false evita que el hash salga en cualquier consulta por descuido.
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: USER_ROLES, default: 'agent' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
  },
);

// Los indices se crean por migracion, no aqui.

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export const UserModel = model('User', userSchema);
