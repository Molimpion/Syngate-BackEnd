import { Request, Response } from 'express';
import { ShiftsService } from './shifts.service';

export class ShiftsController {
  private shiftsService = new ShiftsService();

  create = async (req: Request, res: Response) => {
    const shift = await this.shiftsService.create(req.body);
    return res.status(201).json({ status: 'success', data: shift });
  };

  findAll = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;

    const result = await this.shiftsService.findAll(page, limit, search);
    
    return res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  };

  findById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    
    const shift = await this.shiftsService.findById(id);
    if (!shift) return res.status(404).json({ status: 'error', message: 'Turno não encontrado.' });
    
    return res.status(200).json({ status: 'success', data: shift });
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      
      const shift = await this.shiftsService.update(id, req.body);
      return res.status(200).json({ status: 'success', data: shift });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ status: 'error', message: 'Turno não encontrado.' });
      }
      throw error;
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      
      await this.shiftsService.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2003') {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Não é possível excluir este turno pois existem usuários vinculados a ele.' 
        });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ status: 'error', message: 'Turno não encontrado.' });
      }
      throw error;
    }
  };
}