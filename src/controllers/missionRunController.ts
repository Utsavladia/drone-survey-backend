import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MissionRun } from '../models/MissionRun';
import Mission from '../models/Mission';

export class MissionRunController {
  startMissionRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { droneId } = req.body;
      const missionId = req.params.id;
      console.log('missionId', missionId);
      console.log('droneId', droneId);

      // Validate IDs
      if (!missionId || !droneId || !mongoose.Types.ObjectId.isValid(missionId) || !mongoose.Types.ObjectId.isValid(droneId)) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: missionId and droneId'
        });
        return;
      }

      // Fetch mission details
      const mission = await Mission.findById(missionId);
      if (!mission) {
        res.status(404).json({
          success: false,
          error: 'Mission not found'
        });
        return;
      }

      // Create new mission run with complete snapshot
      const missionRun = new MissionRun({
        mission_id: missionId,
        drone_id: droneId,
        status: 'in_progress',
        started_at: new Date(),
        missionSnapshot: {
          name: mission.name,
          description: mission.description,
          flightPath: mission.flightPath,
          site: mission.site,
          pattern: mission.pattern,
          parameters: mission.parameters
        }
      });

      // Save the mission run
      await missionRun.save();

      res.status(201).json({
        success: true,
        data: missionRun
      });
    } catch (error) {
      console.error('Error starting mission run:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
} 