import { Usuario, PapelUsuario } from '@prisma/client';

export type UsuarioDTO = Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm' | 'logs' | 'tokens'>;
export type UsuarioPublico = Omit<Usuario, 'hashSenha' | 'tokenVerificacao'>;
export interface CreateUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  matricula?: string;
  curso?: string;
  papel?: PapelUsuario;
  turnoId?: string;
}

export interface UpdateUsuarioPayload {
  nome?: string;
  email?: string;
  matricula?: string;
  curso?: string;
  papel?: PapelUsuario;
  turnoId?: string;
  ativo?: boolean;
}