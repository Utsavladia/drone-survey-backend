import express from 'express';
import {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  getCurrentMission
} from '../controllers/missionController';
import { MissionRunController } from '../controllers/missionRunController';

const missionRunController = new MissionRunController();

const router = express.Router();

// Specific routes first
router.get('/running', missionRunController.getRunningMissions);
router.get('/current/:droneId', getCurrentMission);

// Parameterized routes last
router.get('/', getAllMissions);
router.post('/', createMission);
router.get('/:id', getMissionById);
router.put('/:id', updateMission);
router.delete('/:id', deleteMission);
router.post('/:id/run', missionRunController.startMissionRun);

export default router; 