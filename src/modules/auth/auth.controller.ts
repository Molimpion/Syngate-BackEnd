import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService = new AuthService();

  login = async (req: Request, res: Response) => {
    const { email, senha } = req.body;

    try {
      const tokens = await this.authService.login({ email, senhaLimpa: senha });
      return res.status(200).json({ status: 'success', data: tokens });
    } catch (error: any) {
      return res.status(401).json({ status: 'error', message: 'Credenciais inválidas.' });
    }
  };

  cadastro = async (req: Request, res: Response) => {
    try {
      const tokens = await this.authService.cadastro(req.body);
      return res.status(201).json({ status: 'success', data: tokens });
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
}