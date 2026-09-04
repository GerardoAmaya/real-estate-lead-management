// Crea la coleccion leads de forma explicita. En Mongo una coleccion nace
// al primer insert, pero declararla aqui permite versionar su ciclo de vida.
module.exports = {
  async up(db) {
    const existing = await db.listCollections({ name: 'leads' }).toArray();
    if (existing.length === 0) {
      await db.createCollection('leads');
    }
  },

  async down(db) {
    await db.collection('leads').drop();
  },
};
