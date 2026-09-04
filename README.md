# Real Estate Lead Management

Modulo de seguimiento de leads inmobiliarios. Prueba tecnica Full Stack.

**Stack:** Angular 16 · Node.js + Express + TypeScript · MongoDB + Mongoose · Docker

> Documentacion en construccion. Se completa al finalizar el desarrollo.

## Inicio rapido

```bash
nvm use                # Node 20 (ver .nvmrc)
cp .env.example .env
npm install            # raiz + backend + frontend
npm run db:up          # MongoDB en Docker
npm run migrate:up     # indices y validators
npm run seed           # datos del Anexo A
npm run dev            # API :3000 + Angular :4200
```

## Estructura

```
.
├── backend/     API REST (Express + TypeScript)
├── frontend/    SPA (Angular 16)
├── seed/        Datos iniciales en JSON y runner de carga
└── .env.example Variables de entorno (unica fuente)
```
