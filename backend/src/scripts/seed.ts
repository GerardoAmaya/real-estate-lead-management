import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { env } from '../config/env';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { LeadModel } from '../modules/leads/lead.model';
import { createLeadSchema } from '../modules/leads/lead.schema';
import { UserModel } from '../modules/auth/user.model';
import { USER_ROLES } from '../modules/auth/user.constants';
import { hashPassword } from '../modules/auth/auth.service';

// Los datos viven en seed/data en la raiz del repositorio; en Docker la ruta
// se sobrescribe con SEED_DATA_DIR porque el contexto de build es distinto.
const DATA_DIR = process.env.SEED_DATA_DIR ?? path.resolve(__dirname, '../../../seed/data');

// El seed valida con los mismos esquemas de la API: nunca inserta datos
// que los endpoints rechazarian.
const seedLeadSchema = createLeadSchema.extend({
  createdAt: z.iso.date('createdAt debe tener formato YYYY-MM-DD'),
});

type SeedLead = z.infer<typeof seedLeadSchema>;

// La contrasena no vive en el JSON: se toma del entorno y se guarda hasheada.
const seedUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z.email().max(160),
    role: z.enum(USER_ROLES),
  })
  .strict();

function readJson(fileName: string): unknown {
  return JSON.parse(readFileSync(path.join(DATA_DIR, fileName), 'utf8')) as unknown;
}

function log(message: string): void {
  process.stdout.write(`${message}\n`);
}

async function seedLeads(fresh: boolean): Promise<void> {
  const parsed = z.array(seedLeadSchema).parse(readJson('leads.json'));

  const existing = await LeadModel.estimatedDocumentCount();
  if (existing > 0 && !fresh) {
    log(`La coleccion leads ya tiene ${existing} documentos. Use --fresh para reemplazarlos.`);
    return;
  }

  if (fresh) {
    const { deletedCount } = await LeadModel.deleteMany({});
    log(`Eliminados ${deletedCount} leads previos.`);
  }

  // timestamps: false evita que Mongoose sobrescriba las fechas del Anexo A.
  const documents = parsed.map((lead: SeedLead) => {
    const { createdAt, ...rest } = lead;
    const date = new Date(`${createdAt}T00:00:00.000Z`);
    return { ...rest, createdAt: date, updatedAt: date };
  });

  await LeadModel.insertMany(documents, { timestamps: false });
  log(`Insertados ${documents.length} leads.`);
}

async function seedUsers(fresh: boolean): Promise<void> {
  const parsed = z.array(seedUserSchema).parse(readJson('users.json'));

  if (fresh) {
    const { deletedCount } = await UserModel.deleteMany({});
    log(`Eliminados ${deletedCount} usuarios previos.`);
  }

  for (const user of parsed) {
    const exists = await UserModel.exists({ email: user.email });
    if (exists) {
      log(`El usuario ${user.email} ya existe, se omite.`);
      continue;
    }
    await UserModel.create({ ...user, password: await hashPassword(env.SEED_ADMIN_PASSWORD) });
    log(`Creado usuario ${user.email} con rol ${user.role}.`);
  }
}

interface SeedSummary {
  totalLeads: number;
  averageBudget: number;
  reservedLeads: number;
  oldest: Date;
  newest: Date;
}

async function verify(): Promise<void> {
  const [summary] = await LeadModel.aggregate<SeedSummary>([
    {
      $group: {
        _id: null,
        totalLeads: { $sum: 1 },
        averageBudget: { $avg: '$budget' },
        reservedLeads: { $sum: { $cond: [{ $eq: ['$status', 'Reservado'] }, 1, 0] } },
        oldest: { $min: '$createdAt' },
        newest: { $max: '$createdAt' },
      },
    },
  ]);

  if (!summary) {
    log('No hay datos para verificar.');
    return;
  }

  const conversionRate = (summary.reservedLeads / summary.totalLeads) * 100;
  const check = (actual: number, expected: number): string =>
    actual === expected ? 'OK' : `<- ESPERADO ${String(expected)}`;

  log('');
  log('Valores de control del Anexo A:');
  log(`  totalLeads      ${summary.totalLeads} ${check(summary.totalLeads, 10)}`);
  log(`  averageBudget   ${summary.averageBudget} ${check(summary.averageBudget, 174000)}`);
  log(`  reservedLeads   ${summary.reservedLeads} ${check(summary.reservedLeads, 2)}`);
  log(`  conversionRate  ${conversionRate} ${check(conversionRate, 20)}`);
  log(
    `  fechas          ${summary.oldest.toISOString().slice(0, 10)} a ${summary.newest
      .toISOString()
      .slice(0, 10)}`,
  );
}

async function main(): Promise<void> {
  const fresh = process.argv.includes('--fresh');

  await connectDatabase();
  log(`Conectado a ${env.MONGODB_DB_NAME}`);

  await seedLeads(fresh);
  await seedUsers(fresh);
  await verify();

  await disconnectDatabase();
}

main().catch((error: unknown) => {
  console.error('\nEl seed fallo:', error instanceof Error ? error.message : error);
  process.exit(1);
});
