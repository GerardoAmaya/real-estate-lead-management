# Datos de prueba

`data/leads.json` contiene los 10 registros del **Anexo A** del enunciado, sin modificar.
Son datos ficticios provistos unicamente para esta evaluacion.

`data/users.json` define el usuario inicial para autenticarse. Su contrasena **no** vive
aqui: la toma el runner desde `SEED_ADMIN_PASSWORD` en el `.env`, y se almacena hasheada.

## Uso

```bash
npm run seed         # idempotente: no duplica si ya existen los registros
npm run seed:fresh   # limpia las colecciones y vuelve a insertar
```

El runner valida cada registro con los mismos esquemas Zod que usa la API, de modo que
el seed no puede insertar datos que los endpoints rechazarian.

## Valores de control

Con estos datos, `GET /api/dashboard/summary` debe devolver:

| Indicador      | Valor                                                          |
| -------------- | -------------------------------------------------------------- |
| totalLeads     | 10                                                             |
| averageBudget  | 174000                                                         |
| reservedLeads  | 2                                                              |
| conversionRate | 20                                                             |
| byStatus       | Nuevo 2, Contactado 2, Calificado 3, Reservado 2, Descartado 1 |
| bySource       | Facebook 3, Instagram 3, Website 2, Referido 2                 |
| byProject      | Residencial Altavista 4, Torres del Valle 3, Vista Verde 3     |
