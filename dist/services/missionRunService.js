"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionRunService = void 0;
const MissionRun_1 = require("../models/MissionRun");
const mongoose_1 = __importDefault(require("mongoose"));
const Mission_1 = __importDefault(require("../models/Mission"));
class MissionRunService {
    startMissionRun(_a) {
        return __awaiter(this, arguments, void 0, function* ({ missionId, droneId }) {
            // Validate IDs
            if (!mongoose_1.default.Types.ObjectId.isValid(missionId) || !mongoose_1.default.Types.ObjectId.isValid(droneId)) {
                throw new Error('Invalid mission ID or drone ID');
            }
            // Fetch mission details
            const mission = yield Mission_1.default.findById(missionId);
            if (!mission) {
                throw new Error('Mission not found');
            }
            // TODO: Add validation to check if mission and drone exist
            // TODO: Add validation to check if drone is available
            // TODO: Add validation to check if mission is valid
            // Create new mission run with complete snapshot
            const missionRun = new MissionRun_1.MissionRun({
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
            yield missionRun.save();
            return missionRun;
        });
    }
}
exports.MissionRunService = MissionRunService;
