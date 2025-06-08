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

router.get('/', getAllMissions);
router.get('/:id', getMissionById);
router.post('/', createMission);
router.put('/:id', updateMission);
router.delete('/:id', deleteMission);
router.get('/current/:droneId', getCurrentMission);



router.post('/:id/run', missionRunController.startMissionRun);
export default router; 