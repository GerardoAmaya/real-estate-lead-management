// Los indices se crean aqui y no con autoIndex de Mongoose: en produccion
// construirlos al arrancar bloquea colecciones grandes.
const INDEXES = [
  // Compuestos con patron ESR: primero el campo filtrado, luego el de orden.
  { key: { status: 1, createdAt: -1 }, name: 'status_createdAt' },
  { key: { source: 1, createdAt: -1 }, name: 'source_createdAt' },
  { key: { project: 1, createdAt: -1 }, name: 'project_createdAt' },
  // Ordenamientos sin filtro previo.
  { key: { createdAt: -1 }, name: 'createdAt_desc' },
  { key: { budget: -1 }, name: 'budget_desc' },
  { key: { email: 1 }, name: 'email_asc' },
];

module.exports = {
  async up(db) {
    await db.collection('leads').createIndexes(
      INDEXES.map((index) => ({ ...index, background: true })),
    );
  },

  async down(db) {
    for (const index of INDEXES) {
      await db.collection('leads').dropIndex(index.name);
    }
  },
};
