import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { comparePassword, hashPassword } from '../../utils/hash';
import { LoginPayload, CadastroPayload, TokenResponse } from '../../types/auth.types';
import { PapelUsuario, TipoToken } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_development';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

export class AuthService {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const usuario = await prisma.usuario.findUnique({
      where: { email: payload.email },
    });

    if (!usuario || !usuario.ativo) {
      throw new Error('Credenciais inválidas.');
    }

    const senhaValida = await comparePassword(payload.senhaLimpa, usuario.hashSenha);

    if (!senhaValida) {
      throw new Error('Credenciais inválidas.');
    }

    return this.generateTokens(usuario.id, usuario.papel);
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as jwt.JwtPayload;
      if (decoded.exp) {
        const tempoRestante = decoded.exp - Math.floor(Date.now() / 1000);
        if (tempoRestante > 0) {
          await redis.set(`blacklist:${accessToken}`, 'true', 'EX', tempoRestante);
        }
      }
    } catch (error) {
      // Ignorar se o token já estiver inválido/expirado na hora do logout
    }
  }

  async cadastro(dados: CadastroPayload): Promise<TokenResponse> {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (usuarioExistente) {
      throw new Error('E-mail já está em uso.');
    }

    const senhaHasheada = await hashPassword(dados.senha);

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        hashSenha: senhaHasheada,
        papel: dados.papel ?? PapelUsuario.ALUNO,
      },
    });

    return this.generateTokens(novoUsuario.id, novoUsuario.papel);
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

    // Rotaciona o token
    await prisma.token.delete({ where: { id: tokenSalvo.id } });

    return this.generateTokens(tokenSalvo.usuarioId, tokenSalvo.usuario.papel);
  }

  private async generateTokens(usuarioId: string, papel: PapelUsuario): Promise<TokenResponse> {
    const accessToken = jwt.sign({ sub: usuarioId, papel }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

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