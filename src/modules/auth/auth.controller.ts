import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response) => {
    const { email, senhaLimpa } = req.body;
    try {
      const tokens = await this.authService.login({ email, senhaLimpa });
      return res.status(200).json({ status: 'success', data: tokens });
    } catch (error: any) {
      if (error.message === 'E-mail não verificado.') {
        return res.status(403).json({ status: 'error', message: error.message });
      }
      return res.status(401).json({ status: 'error', message: 'Credenciais inválidas.' });
    }
  };

  cadastro = async (req: Request, res: Response) => {
    try {
      const resultado = await this.authService.cadastro(req.body);
      return res.status(201).json({ status: 'success', data: resultado });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  };

  verificarEmail = async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Token de verificação ausente ou inválido.' });
    }
    try {
      const resultado = await this.authService.verificarEmail(token);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  };

  refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    try {
      const tokens = await this.authService.refreshToken(refreshToken);
      return res.status(200).json({ status: 'success', data: tokens });
    } catch (error: any) {
      return res.status(401).json({ status: 'error', message: 'Sessão expirada. Faça login novamente.' });
    }
  };

  logout = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      await this.authService.logout(token);
    }
    return res.status(204).send();
  };

  trocarSenha = async (req: Request, res: Response) => {
    const usuarioId = req.user!.sub;
    const { senhaAtual, novaSenha } = req.body;
    try {
      await this.authService.trocarSenha(usuarioId, senhaAtual, novaSenha);
      return res.status(200).json({ status: 'success', message: 'Senha alterada com sucesso.' });
    } catch (error: any) {
      if (error.message.startsWith('401:')) {
        return res.status(401).json({ status: 'error', message: 'Credenciais inválidas.' });
      }
      throw error;
    }
  };
}