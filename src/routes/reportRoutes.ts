import express from 'express';
import {
  getAllReports,
  getReportById,
  getReportByMission
} from '../controllers/reportController';

const router = express.Router();

router.get('/', getAllReports);
router.get('/:id', getReportById);
router.get('/mission/:missionId', getReportByMission);

export default router; 