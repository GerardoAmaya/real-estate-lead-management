# Real Estate Lead Management

[![CI](https://github.com/GerardoAmaya/real-estate-lead-management/actions/workflows/ci.yml/badge.svg)](https://github.com/GerardoAmaya/real-estate-lead-management/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=GerardoAmaya_real-estate-lead-management&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=GerardoAmaya_real-estate-lead-management)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=GerardoAmaya_real-estate-lead-management&metric=coverage)](https://sonarcloud.io/summary/new_code?id=GerardoAmaya_real-estate-lead-management)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=GerardoAmaya_real-estate-lead-management&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=GerardoAmaya_real-estate-lead-management)

Modulo de seguimiento de leads inmobiliarios. Prueba tecnica Full Stack.

**Stack:** Angular 16 · Node.js + Express 5 + TypeScript · MongoDB + Mongoose · Docker

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

## Pruebas

```bash
npm test               # Jest: unitarias + integracion
npm run test:cov       # con reporte de cobertura
```

Las pruebas levantan un MongoDB en memoria: no requieren Docker ni una
instancia local.

## Estructura

```
.
├── backend/     API REST (Express + TypeScript)
├── frontend/    SPA (Angular 16)
├── seed/        Datos iniciales en JSON
└── .env.example Variables de entorno (unica fuente)
```
