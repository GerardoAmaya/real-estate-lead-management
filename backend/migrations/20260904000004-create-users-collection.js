// Coleccion de usuarios para la autenticacion.
module.exports = {
  async up(db) {
    const existing = await db.listCollections({ name: 'users' }).toArray();
    if (existing.length === 0) {
      await db.createCollection('users');
    }
  },

  async down(db) {
    await db.collection('users').drop();
  },
};
