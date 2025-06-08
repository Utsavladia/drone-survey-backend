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
exports.MissionRunController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MissionRun_1 = require("../models/MissionRun");
const Mission_1 = __importDefault(require("../models/Mission"));
class MissionRunController {
    constructor() {
        this.startMissionRun = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { droneId } = req.body;
                const missionId = req.params.id;
                console.log('Backend: Starting mission run - missionId:', missionId, 'droneId:', droneId);
                // Validate IDs
                if (!missionId || !droneId || !mongoose_1.default.Types.ObjectId.isValid(missionId) || !mongoose_1.default.Types.ObjectId.isValid(droneId)) {
                    console.log('Backend: Invalid IDs provided');
                    res.status(400).json({
                        success: false,
                        error: 'Missing required fields: missionId and droneId'
                    });
                    return;
                }
                // Fetch mission details
                const mission = yield Mission_1.default.findById(missionId);
                if (!mission) {
                    console.log('Backend: Mission not found');
                    res.status(404).json({
                        success: false,
                        error: 'Mission not found'
                    });
                    return;
                }
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
                // Save the mission run
                yield missionRun.save();
                console.log('Backend: Mission run created successfully:', missionRun._id);
                res.status(201).json({
                    success: true,
                    data: missionRun
                });
            }
            catch (error) {
                console.error('Backend: Error starting mission run:', error);
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : 'Internal server error'
                });
            }
        });
        this.getRunningMissions = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log('Backend: getRunningMissions function started');
            try {
                console.log('Backend: About to query database for running missions');
                const runningMissions = yield MissionRun_1.MissionRun.find({ status: 'in_progress' })
                    .populate('drone_id', 'name status')
                    .sort({ started_at: -1 })
                    .lean();
                console.log('Backend: Database query completed, found missions:', runningMissions.length);
                if (!runningMissions) {
                    console.log('Backend: No running missions found');
                    res.status(200).json({
                        success: true,
                        data: []
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: runningMissions
                });
            }
            catch (error) {
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
        });
    }
}
exports.MissionRunController = MissionRunController;
