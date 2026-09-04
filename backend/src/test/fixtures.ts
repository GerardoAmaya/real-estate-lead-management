import { readFileSync } from 'node:fs';
import path from 'node:path';
import { LeadModel } from '../modules/leads/lead.model';
import { UserModel } from '../modules/auth/user.model';
import { hashPassword } from '../modules/auth/auth.service';

interface RawLead {
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: string;
  budget: number;
  project: string;
  createdAt: string;
}

// Los tests usan el mismo dataset del Anexo A que el seed: si el archivo
// cambia, los valores de control del enunciado siguen siendo la referencia.
const DATA_DIR = path.resolve(__dirname, '../../../seed/data');

export function anexoALeads(): RawLead[] {
  return JSON.parse(readFileSync(path.join(DATA_DIR, 'leads.json'), 'utf8')) as RawLead[];
}

export async function seedAnexoA(): Promise<void> {
  const documents = anexoALeads().map(({ createdAt, ...rest }) => {
    const date = new Date(`${createdAt}T00:00:00.000Z`);
    return { ...rest, createdAt: date, updatedAt: date };
  });
  await LeadModel.insertMany(documents, { timestamps: false });
}

export const TEST_USER = {
  name: 'Tester',
  email: 'tester@example.com',
  password: 'Secreta123!',
  role: 'admin' as const,
};

export async function createTestUser(): Promise<void> {
  await UserModel.create({
    name: TEST_USER.name,
    email: TEST_USER.email,
    password: await hashPassword(TEST_USER.password),
    role: TEST_USER.role,
  });
}

// as const conserva los literales del enum en lugar de ensancharlos a string.
export const VALID_LEAD = {
  name: 'Nuevo Prospecto',
  email: 'prospecto@example.com',
  source: 'Website',
  budget: 180000,
  project: 'Vista Verde',
  status: 'Nuevo',
} as const;
