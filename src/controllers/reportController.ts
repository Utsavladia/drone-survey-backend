import { Request, Response } from 'express';
import SurveyReport from '../models/SurveyReport';

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await SurveyReport.find();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const report = await SurveyReport.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

export const getReportByMission = async (req: Request, res: Response) => {
  try {
    const report = await SurveyReport.findOne({ mission: req.params.missionId });
    if (!report) return res.status(404).json({ error: 'Report not found for this mission' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
}; 