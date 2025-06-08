import { Request, Response } from 'express';
import Mission from '../models/Mission';
import mongoose from 'mongoose';

interface ValidationError {
  field: string;
  message: string;
}

const validateMissionData = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.name?.trim()) errors.push({ field: 'name', message: 'Name is required' });
  if (!data.site?.trim()) errors.push({ field: 'site', message: 'Site is required' });
  if (!data.assignedDrone) errors.push({ field: 'assignedDrone', message: 'Drone assignment is required' });
  
  // Validate flight path
  if (!Array.isArray(data.flightPath) || data.flightPath.length < 2) {
    errors.push({ field: 'flightPath', message: 'At least 2 waypoints are required' });
  } else {
    data.flightPath.forEach((waypoint: any, index: number) => {
      if (typeof waypoint.lat !== 'number' || typeof waypoint.lng !== 'number' || typeof waypoint.altitude !== 'number') {
        errors.push({ 
          field: `flightPath[${index}]`, 
          message: 'Invalid waypoint coordinates or altitude' 
        });
      }
    });
  }

  return errors;
};

export const getAllMissions = async (req: Request, res: Response) => {
  try {
    const missions = await Mission.find().sort({ createdAt: -1 });
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
  console.log('Creating mission with data:', req.body);
  
  try {
    const { name, description, site, assignedDrone, flightPath, pattern, parameters } = req.body;

    // Basic validation
    if (!name || !assignedDrone || !flightPath || flightPath.length === 0) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['name', 'assignedDrone', 'flightPath']
      });
    }

    // Convert assignedDrone string to ObjectId
    let droneId: mongoose.Types.ObjectId;
    try {
      droneId = new mongoose.Types.ObjectId(assignedDrone);
      console.log('Converted droneId:', droneId);
    } catch (error) {
      console.log('Invalid droneId format:', error);
      return res.status(400).json({
        message: 'Invalid drone ID format',
        field: 'assignedDrone'
      });
    }

    const mission = new Mission({
      name,
      description,
      site,
      assignedDrone: droneId,
      flightPath,
      pattern: pattern || 'custom',
      parameters: parameters || {
        altitude: 100,
        overlap: 70,
        frequency: 1,
        sensors: ['rgb']
      },
      status: 'planned'
    });

    console.log('Saving mission to database...');
    const savedMission = await mission.save();
    console.log('Mission saved successfully:', savedMission._id);
    
    res.status(201).json(savedMission);
  } catch (error) {
    console.error('Error creating mission:', error);
    res.status(500).json({ 
      message: 'Error creating mission',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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

export const getCurrentMission = async (req: Request, res: Response) => {
  try {
    const { droneId } = req.params;
    const mission = await Mission.findOne({
      assignedDrone: droneId,
      status: { $in: ['in-progress', 'paused'] }
    }).sort({ updatedAt: -1 });
    if (!mission) return res.status(404).json({ error: 'No current mission' });
    res.json(mission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current mission' });
  }
}; 