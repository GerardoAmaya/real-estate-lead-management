// Corta la instalacion con un mensaje accionable cuando la version de Node no es la
// que fija .nvmrc. Sin esto npm solo emite un WARN facil de pasar por alto y el fallo
// real aparece mas tarde, con mucho menos contexto.
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const raiz = join(__dirname, '..');
const esperada = readFileSync(join(raiz, '.nvmrc'), 'utf8').trim();

const partes = (version) => version.replace(/^v/, '').split('.').map(Number);
const minima = partes(esperada);
const actual = partes(process.version);

// Comparacion numerica por posicion: 0 si son iguales, negativo si actual es menor.
const diferencia = minima.reduce((acc, valor, i) => acc || (actual[i] ?? 0) - valor, 0);

// Misma serie mayor que .nvmrc y, dentro de ella, igual o mas nueva.
if (actual[0] !== minima[0] || diferencia < 0) {
  console.error(`
  Node ${process.version} no sirve para este proyecto.
  Hace falta Node ${esperada} o superior dentro de la serie ${minima[0]}.x (ver .nvmrc).

    nvm install ${esperada}
    nvm use ${esperada}

  En macOS y Linux basta con "nvm use": leen .nvmrc solos.
`);
  process.exit(1);
}
