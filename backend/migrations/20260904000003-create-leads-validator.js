// Validacion a nivel del motor: protege los datos aunque alguien escriba
// desde mongosh saltandose la aplicacion. Defensa en profundidad sobre Zod.
const LEAD_VALIDATOR = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'source', 'status', 'budget', 'project', 'createdAt', 'updatedAt'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      name: { bsonType: 'string', minLength: 2, maxLength: 120 },
      email: { bsonType: 'string', maxLength: 160, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
      phone: { bsonType: 'string', maxLength: 30 },
      source: { enum: ['Facebook', 'Instagram', 'Website', 'Referido'] },
      status: { enum: ['Nuevo', 'Contactado', 'Calificado', 'Reservado', 'Descartado'] },
      budget: {
        bsonType: ['int', 'long', 'double', 'decimal'],
        minimum: 0,
        exclusiveMinimum: true,
      },
      project: { bsonType: 'string', minLength: 2, maxLength: 120 },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

module.exports = {
  async up(db) {
    await db.command({
      collMod: 'leads',
      validator: LEAD_VALIDATOR,
      validationLevel: 'strict',
      validationAction: 'error',
    });
  },

  async down(db) {
    await db.command({ collMod: 'leads', validator: {}, validationLevel: 'off' });
  },
};
