import { Request, Response } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  private usersService = new UsersService();

  create = async (req: Request, res: Response) => {
    try {
      const user = await this.usersService.create(req.body);
      return res.status(201).json({ status: 'success', data: user });
    } catch (error: any) {
      if (error.message.startsWith('409:')) {
        return res.status(409).json({ status: 'error', message: error.message.split(':')[1] });
      }
      throw error;
    }
  };

  findAll = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const search = req.query.search as string | undefined;

    const result = await this.usersService.findAll(page, limit, search);
    
    return res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  };

  getProfile = async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const user = await this.usersService.findById(userId);
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuário não encontrado.' });
    return res.status(200).json({ status: 'success', data: user });
  };

  findById = async (req: Request, res: Response) => {
    const id = req.params.id as string; 
    const user = await this.usersService.findById(id);
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuário não encontrado.' });
    return res.status(200).json({ status: 'success', data: user });
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const user = await this.usersService.update(id, req.body);
      return res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      return res.status(400).json({ status: 'error', message: 'Erro ao atualizar usuário.' });
    }
  };

  delete = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.usersService.softDelete(id);
    return res.status(204).send();
  };

  linkCard = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const user = await this.usersService.linkCard(id, req.body.cartaoId);
      return res.status(200).json({ status: 'success', data: user });
    } catch (error: any) {
      if (error.message.startsWith('409:')) {
        return res.status(409).json({ status: 'error', message: error.message.split(':')[1] });
      }
      throw error;
    }
  };
}