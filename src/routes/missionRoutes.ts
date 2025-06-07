import express from 'express';
import {
  getAllMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
  pauseMission,
  resumeMission,
  abortMission
} from '../controllers/missionController';

const router = express.Router();

router.get('/', getAllMissions);
router.get('/:id', getMissionById);
router.post('/', createMission);
router.put('/:id', updateMission);
router.delete('/:id', deleteMission);

// Mission control actions
router.post('/:id/pause', pauseMission);
router.post('/:id/resume', resumeMission);
router.post('/:id/abort', abortMission);

export default router; 