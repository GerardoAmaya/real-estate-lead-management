import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { UserModel } from './user.model';
import type { UserRole } from './user.constants';
import type { LoginInput } from './auth.schema';

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: string;
  user: { id: string; name: string; email: string; role: UserRole };
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_SALT_ROUNDS);
}

export async function login(input: LoginInput): Promise<LoginResult> {
  // select('+password') porque el campo esta excluido por defecto en el modelo.
  const user = await UserModel.findOne({ email: input.email }).select('+password').exec();

  // Comparar siempre, aunque el usuario no exista: evita distinguir por tiempo
  // de respuesta si un correo esta registrado (enumeracion de usuarios).
  const hash = user?.password ?? '$2a$12$invalidhashinvalidhashinvalidhashinvalidhashinvalidha';
  const matches = await bcrypt.compare(input.password, hash);

  // Mensaje identico para correo inexistente y contrasena incorrecta.
  if (!user || !matches) throw AppError.invalidCredentials();

  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return {
    accessToken,
    expiresIn: env.JWT_EXPIRES_IN,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
