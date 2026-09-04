// Validacion a nivel del motor, igual que en leads.
const USER_VALIDATOR = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'password', 'role', 'createdAt', 'updatedAt'],
    additionalProperties: false,
    properties: {
      _id: { bsonType: 'objectId' },
      name: { bsonType: 'string', minLength: 2, maxLength: 120 },
      email: { bsonType: 'string', maxLength: 160, pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
      // Longitud de un hash bcrypt: nunca debe guardarse texto plano.
      password: { bsonType: 'string', minLength: 55, maxLength: 72 },
      role: { enum: ['admin', 'agent'] },
      createdAt: { bsonType: 'date' },
      updatedAt: { bsonType: 'date' },
    },
  },
};

module.exports = {
  async up(db) {
    await db.command({
      collMod: 'users',
      validator: USER_VALIDATOR,
      validationLevel: 'strict',
      validationAction: 'error',
    });
  },

  async down(db) {
    await db.command({ collMod: 'users', validator: {}, validationLevel: 'off' });
  },
};
