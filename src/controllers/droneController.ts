import { Request, Response } from 'express';
import Drone from '../models/Drone';

export const getAllDrones = async (req: Request, res: Response) => {
  try {
    const drones = await Drone.find();
    res.json(drones);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drones' });
  }
};

export const getDroneById = async (req: Request, res: Response) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json(drone);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drone' });
  }
};

export const createDrone = async (req: Request, res: Response) => {
  try {
    const drone = new Drone(req.body);
    await drone.save();
    res.status(201).json(drone);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create drone' });
  }
};

export const updateDrone = async (req: Request, res: Response) => {
  try {
    const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json(drone);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update drone' });
  }
};

export const deleteDrone = async (req: Request, res: Response) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json({ message: 'Drone deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete drone' });
  }
}; 