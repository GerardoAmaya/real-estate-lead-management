// Se ejecuta antes de importar la configuracion, que valida al cargarse.
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.JWT_SECRET = 'clave-de-pruebas-suficientemente-larga-para-zod-1234';
process.env.JWT_EXPIRES_IN = '1h';
// Cost bajo: bcrypt con 12 haria la suite lenta sin aportar nada.
process.env.BCRYPT_SALT_ROUNDS = '10';
// Limites altos para que la suite no se autobloquee al ejercitar el login.
process.env.RATE_LIMIT_MAX = '10000';
process.env.LOGIN_RATE_LIMIT_MAX = '10000';
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/test_db';
