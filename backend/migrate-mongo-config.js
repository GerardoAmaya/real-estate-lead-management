// Configuracion de migrate-mongo: los indices y validators se crean aqui,
// nunca con autoIndex de Mongoose (bloqueante en colecciones grandes).
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/real_estate_leads',
    options: { },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs',
};
