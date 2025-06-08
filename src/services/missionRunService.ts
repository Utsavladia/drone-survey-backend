import { MissionRun, IMissionRun } from '../models/MissionRun';
import mongoose from 'mongoose';
import Mission from '../models/Mission';

interface StartMissionRunParams {
  missionId: string;
  droneId: string;
}

export class MissionRunService {
  async startMissionRun({ missionId, droneId }: StartMissionRunParams): Promise<IMissionRun> {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(missionId) || !mongoose.Types.ObjectId.isValid(droneId)) {
      throw new Error('Invalid mission ID or drone ID');
    }

    // Fetch mission details
    const mission = await Mission.findById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    // TODO: Add validation to check if mission and drone exist
    // TODO: Add validation to check if drone is available
    // TODO: Add validation to check if mission is valid

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

    await missionRun.save();
    return missionRun;
  }
} 