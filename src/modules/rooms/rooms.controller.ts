import { Request, Response } from 'express';
import { RoomsService } from './rooms.service';

export class RoomsController {
  private roomsService = new RoomsService();

  create = async (req: Request, res: Response) => {
    try {
      const room = await this.roomsService.create(req.body);
      return res.status(201).json({ status: 'success', data: room });
    } catch (error: any) {
      if (error.message.startsWith('409:')) {
        return res.status(409).json({ status: 'error', message: error.message.split(':')[1] });
      }
      throw error;
    }
  };

  findAll = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;

    const result = await this.roomsService.findAll(page, limit, search);
    
    return res.status(200).json({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  };

  findById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    
    const room = await this.roomsService.findById(id);
    if (!room) return res.status(404).json({ status: 'error', message: 'Sala não encontrada.' });
    
    return res.status(200).json({ status: 'success', data: room });
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      
      const room = await this.roomsService.update(id, req.body);
      return res.status(200).json({ status: 'success', data: room });
    } catch (error: any) {
      if (error.message.startsWith('409:')) {
        return res.status(409).json({ status: 'error', message: error.message.split(':')[1] });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ status: 'error', message: 'Sala não encontrada.' });
      }
      throw error;
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      
      await this.roomsService.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2003') {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Não é possível excluir esta sala pois existem dispositivos vinculados a ela.' 
        });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ status: 'error', message: 'Sala não encontrada.' });
      }
      throw error;
    }
  };
}