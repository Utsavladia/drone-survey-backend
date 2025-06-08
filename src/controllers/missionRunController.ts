import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MissionRun } from '../models/MissionRun';
import Mission from '../models/Mission';
import { startSimulation, activeSimulations } from '../services/missionSimulationManager';

export class MissionRunController {
  startMissionRun = async (req: Request, res: Response): Promise<void> => {
    try {
      const { droneId } = req.body;
      const missionId = req.params.id;
      console.log('Backend: Starting mission run - missionId:', missionId, 'droneId:', droneId);

      // Validate IDs
      if (!missionId || !droneId || !mongoose.Types.ObjectId.isValid(missionId) || !mongoose.Types.ObjectId.isValid(droneId)) {
        console.log('Backend: Invalid IDs provided');
        res.status(400).json({
          success: false,
          error: 'Missing required fields: missionId and droneId'
        });
        return;
      }

      // Fetch mission details
      const mission = await Mission.findById(missionId);
      if (!mission) {
        console.log('Backend: Mission not found');
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
      console.log('Backend: Mission run created successfully:', missionRun._id);

      // Start the mission simulation
      try {
        const waypoints = mission.flightPath.map(point => ({
          lat: point.lat,
          lng: point.lng
        }));
        startSimulation(missionRun._id.toString(), waypoints);
        console.log('Backend: Mission simulation started for run:', missionRun._id);
      } catch (simError) {
        console.error('Backend: Error starting mission simulation:', simError);
        // Don't fail the mission run if simulation fails
      }

      res.status(201).json({
        success: true,
        data: missionRun
      });
    } catch (error) {
      console.error('Backend: Error starting mission run:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getRunningMissions = async (req: Request, res: Response): Promise<void> => {
    console.log('Backend: getRunningMissions function started');
    try {
      console.log('Backend: About to query database for running missions');
      const runningMissions = await MissionRun.find({ status: 'in_progress' })
        .populate('drone_id', 'name status')
        .sort({ started_at: -1 })
        .lean();

      console.log('Backend: Database query completed, found missions:', runningMissions.length);
      
      // Enhance running missions with simulation data
      const enhancedMissions = runningMissions.map(mission => {
        const simulation = activeSimulations.get(mission._id.toString());
        return {
          ...mission,
          simulation: simulation ? {
            progress: simulation.progress,
            currentPosition: simulation.currentPosition,
            status: simulation.status
          } : null
        };
      });

      if (!enhancedMissions) {
        console.log('Backend: No running missions found');
        res.status(200).json({
          success: true,
          data: []
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: enhancedMissions
      });
    } catch (error) {
      console.error('Backend: Detailed error in getRunningMissions:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getMissionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Backend: Fetching mission history');
      
      const historyMissions = await MissionRun.find({
        status: { $in: ['completed', 'failed'] }
      })
        .populate('drone_id', 'name status')
        .sort({ completed_at: -1 })
        .lean();

      console.log('Backend: Found historical missions:', historyMissions.length);

      res.status(200).json({
        success: true,
        data: historyMissions
      });
    } catch (error) {
      console.error('Backend: Error fetching mission history:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
} 