import { Request, Response } from 'express';
import Drone from '../models/Drone';

export const getAllDrones = async (req: Request, res: Response) => {
  try {
    const drones = await Drone.find();
    res.json(drones);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drones', error });
  }
};

export const getDroneById = async (req: Request, res: Response) => {
  try {
    const drone = await Drone.findById(req.params.id);
    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }
    res.json(drone);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching drone', error });
  }
};

export const createDrone = async (req: Request, res: Response) => {
  try {
    const drone = new Drone(req.body);
    const savedDrone = await drone.save();
    res.status(201).json(savedDrone);
  } catch (error) {
    res.status(400).json({ message: 'Error creating drone', error });
  }
};

export const updateDrone = async (req: Request, res: Response) => {
  try {
    const drone = await Drone.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }
    res.json(drone);
  } catch (error) {
    res.status(400).json({ message: 'Error updating drone', error });
  }
};

export const deleteDrone = async (req: Request, res: Response) => {
  try {
    const drone = await Drone.findByIdAndDelete(req.params.id);
    if (!drone) {
      return res.status(404).json({ message: 'Drone not found' });
    }
    res.json({ message: 'Drone deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting drone', error });
  }
}; 