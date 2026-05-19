import { Usuario } from '@prisma/client';

export type UsuarioDTO = Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm' | 'logs' | 'tokens'>;

export type UsuarioPublico = Omit<Usuario, 'hashSenha'>;