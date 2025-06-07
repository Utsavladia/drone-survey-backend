import express from 'express';
import {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  getCurrentMission
} from '../controllers/missionController';

const router = express.Router();

router.get('/', getAllMissions);
router.get('/:id', getMissionById);
router.post('/', createMission);
router.put('/:id', updateMission);
router.delete('/:id', deleteMission);
router.get('/current/:droneId', getCurrentMission);

export default router; 