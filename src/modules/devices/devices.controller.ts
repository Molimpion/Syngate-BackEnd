import { Request, Response } from 'express';
import { DevicesService } from './devices.service';

export class DevicesController {
  private devicesService = new DevicesService();

  create = async (req: Request, res: Response) => {
    try {
      const result = await this.devicesService.provision(req.body);
      return res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      if (error.message.startsWith('409:')) return res.status(409).json({ status: 'error', message: error.message.split(':')[1] });
      if (error.message.startsWith('400:')) return res.status(400).json({ status: 'error', message: error.message.split(':')[1] });
      throw error;
    }
  };

  findAll = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string | undefined;

    const result = await this.devicesService.findAll(page, limit, search);
    return res.status(200).json({ status: 'success', data: result.data, meta: result.meta });
  };

  findById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const device = await this.devicesService.findById(id);
    if (!device) return res.status(404).json({ status: 'error', message: 'Dispositivo não encontrado.' });
    return res.status(200).json({ status: 'success', data: device });
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const device = await this.devicesService.update(id, req.body);
      return res.status(200).json({ status: 'success', data: device });
    } catch (error: any) {
      if (error.message.startsWith('409:')) return res.status(409).json({ status: 'error', message: error.message.split(':')[1] });
      if (error.message.startsWith('400:')) return res.status(400).json({ status: 'error', message: error.message.split(':')[1] });
      if (error.message.startsWith('404:')) return res.status(404).json({ status: 'error', message: error.message.split(':')[1] });
      throw error;
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await this.devicesService.delete(id);
      return res.status(204).send();
    } catch (error: any) {
      if (error.message.startsWith('404:')) return res.status(404).json({ status: 'error', message: error.message.split(':')[1] });
      throw error;
    }
  };
}