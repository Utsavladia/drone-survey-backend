import { Request, Response } from 'express';
import Mission from '../models/Mission';

export const getAllMissions = async (req: Request, res: Response) => {
  try {
    const missions = await Mission.find();
    res.json(missions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
};

export const getMissionById = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json(mission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mission' });
  }
};

export const createMission = async (req: Request, res: Response) => {
  try {
    const mission = new Mission(req.body);
    await mission.save();
    res.status(201).json(mission);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create mission' });
  }
};

export const updateMission = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json(mission);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update mission' });
  }
};

export const deleteMission = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json({ message: 'Mission deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete mission' });
  }
};

// Mission control actions
export const pauseMission = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, { status: 'paused' }, { new: true });
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json(mission);
  } catch (err) {
    res.status(400).json({ error: 'Failed to pause mission' });
  }
};

export const resumeMission = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, { status: 'in-progress' }, { new: true });
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json(mission);
  } catch (err) {
    res.status(400).json({ error: 'Failed to resume mission' });
  }
};

export const abortMission = async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, { status: 'aborted' }, { new: true });
    if (!mission) return res.status(404).json({ error: 'Mission not found' });
    res.json(mission);
  } catch (err) {
    res.status(400).json({ error: 'Failed to abort mission' });
  }
}; 