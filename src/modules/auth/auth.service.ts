import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { comparePassword, hashPassword } from '../../shared/utils/hash';
import { LoginPayload, CadastroPayload, TokenResponse } from '../../shared/types/auth.types';
import { PapelUsuario, TipoToken } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET não definido. Configure a variável de ambiente antes de iniciar.');
}

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export class AuthService {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    console.log('LOGIN CHAMADO:', payload.email);
    const usuario = await prisma.usuario.findUnique({
      where: { email: payload.email },
    });
    console.log('USUARIO ENCONTRADO:', usuario?.email, 'ativo:', usuario?.ativo, 'verificado:', usuario?.emailVerificado);

    if (!usuario || !usuario.ativo) {
      throw new Error('Credenciais inválidas.');
    }

    if (!usuario.emailVerificado) {
      throw new Error('E-mail não verificado.');
    }

    console.log('HASH DO BANCO:', JSON.stringify(usuario.hashSenha));
    console.log('SENHA RECEBIDA:', JSON.stringify(payload.senhaLimpa));
    const senhaValida = await comparePassword(payload.senhaLimpa, usuario.hashSenha);
    console.log('bate?', senhaValida);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas.');
    }

    return this.generateTokens(usuario.id, usuario.papel);
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET!) as jwt.JwtPayload;
      if (decoded.exp) {
        const tempoRestante = decoded.exp - Math.floor(Date.now() / 1000);
        if (tempoRestante > 0) {
          await redis.set(`blacklist:${accessToken}`, 'true', 'EX', tempoRestante);
        }
      }
    } catch {
      // Token já inválido/expirado — sem ação necessária
    }
  }

  async cadastro(dados: CadastroPayload): Promise<{ message: string }> {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (usuarioExistente) {
      throw new Error('E-mail já está em uso.');
    }

    const senhaHasheada = await hashPassword(dados.senha);
    const tokenVerificacao = randomBytes(32).toString('hex');

    await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        hashSenha: senhaHasheada,
        papel: dados.papel ?? PapelUsuario.ALUNO,
        emailVerificado: false,
        tokenVerificacao,
      },
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Token de verificação para ${dados.email}: ${tokenVerificacao}`);
    }

    return { message: 'Cadastro realizado. Verifique seu e-mail para ativar a conta.' };
  }

  async verificarEmail(token: string): Promise<{ message: string }> {
    const usuario = await prisma.usuario.findUnique({
      where: { tokenVerificacao: token },
    });

    if (!usuario) {
      throw new Error('Token de verificação inválido ou já utilizado.');
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        emailVerificado: true,
        tokenVerificacao: null,
      },
    });

    return { message: 'E-mail verificado com sucesso. Você já pode fazer login.' };
  }

  async refreshToken(tokenString: string): Promise<TokenResponse> {
    const hash = createHash('sha256').update(tokenString).digest('hex');

    const tokenSalvo = await prisma.token.findUnique({
      where: { hash },
      include: { usuario: true },
    });

    if (
      !tokenSalvo ||
      tokenSalvo.revogado ||
      (tokenSalvo.dataExpiracao && tokenSalvo.dataExpiracao < new Date())
    ) {
      throw new Error('Refresh token inválido ou expirado.');
    }

    if (!tokenSalvo.usuario.ativo) {
      throw new Error('Usuário inativo.');
    }

    await prisma.token.delete({ where: { id: tokenSalvo.id } });

    return this.generateTokens(tokenSalvo.usuarioId, tokenSalvo.usuario.papel);
  }

  async trocarSenha(usuarioId: string, senhaAtual: string, novaSenha: string): Promise<void> {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });

    if (!usuario) {
      throw new Error('401:Credenciais inválidas.');
    }

    const senhaValida = await comparePassword(senhaAtual, usuario.hashSenha);
    if (!senhaValida) {
      throw new Error('401:Credenciais inválidas.');
    }

    const novoHash = await hashPassword(novaSenha);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { hashSenha: novoHash },
    });
  }

  private async generateTokens(usuarioId: string, papel: PapelUsuario): Promise<TokenResponse> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nome: true },
    });

    const accessToken = jwt.sign(
      { sub: usuarioId, papel, nome: usuario?.nome ?? '' },
      JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );

    const refreshTokenString = randomBytes(40).toString('hex');
    const refreshTokenHash = createHash('sha256').update(refreshTokenString).digest('hex');
    const expiracao = new Date();
    expiracao.setDate(expiracao.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await prisma.token.create({
      data: {
        tipo: TipoToken.REFRESH,
        hash: refreshTokenHash,
        usuarioId,
        dataExpiracao: expiracao,
      },
    });

    return { accessToken, refreshToken: refreshTokenString };
  }
}