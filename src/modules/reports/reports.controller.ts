import { Request, Response } from 'express';
import { ReportsService } from './reports.service';

export class ReportsController {
  private reportsService = new ReportsService();

  getStats = async (_req: Request, res: Response) => {
    const stats = await this.reportsService.getStats();
    return res.status(200).json({ status: 'success', data: stats });
  };

  getDashboardData = async (req: Request, res: Response) => {
    const report = await this.reportsService.getAccessReport(req.query);
    return res.status(200).json({ status: 'success', data: report });
  };

  downloadCSV = async (req: Request, res: Response) => {
    const csvString = await this.reportsService.generateCSV(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-acessos-${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  };
}