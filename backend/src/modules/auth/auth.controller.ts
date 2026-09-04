import type { RequestHandler } from 'express';
import * as authService from './auth.service';
import type { LoginInput } from './auth.schema';

export const login: RequestHandler = async (req, res) => {
  res.json(await authService.login(req.body as LoginInput));
};

export const me: RequestHandler = (req, res) => {
  res.json(req.user);
};
