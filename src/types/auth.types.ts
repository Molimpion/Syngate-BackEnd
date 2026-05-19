import { PapelUsuario } from '@prisma/client';

export interface LoginPayload {
  email: string;
  senhaLimpa: string;
}

export interface JwtPayload {
  sub: string;
  papel: PapelUsuario;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
}