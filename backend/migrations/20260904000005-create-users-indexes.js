// El indice unico de email es la garantia real contra usuarios duplicados:
// una comprobacion previa en la aplicacion tiene condicion de carrera.
const INDEXES = [{ key: { email: 1 }, name: 'email_unique', unique: true }];

module.exports = {
  async up(db) {
    await db.collection('users').createIndexes(INDEXES.map((i) => ({ ...i, background: true })));
  },

  async down(db) {
    for (const index of INDEXES) {
      await db.collection('users').dropIndex(index.name);
    }
  },
};
