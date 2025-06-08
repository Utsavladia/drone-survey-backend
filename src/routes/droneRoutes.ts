import express from 'express';
import {
  getAllDrones,
  getDroneById,
  createDrone,
  updateDrone,
  deleteDrone,
  getAvailableDrones
} from '../controllers/droneController';

const router = express.Router();

router.get('/', getAllDrones);
router.get('/available', getAvailableDrones);
router.get('/:id', getDroneById);
router.post('/', createDrone);
router.put('/:id', updateDrone);
router.delete('/:id', deleteDrone);

export default router; 