"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const missionController_1 = require("../controllers/missionController");
const missionRunController_1 = require("../controllers/missionRunController");
const missionRunController = new missionRunController_1.MissionRunController();
const router = express_1.default.Router();
router.get('/', missionController_1.getAllMissions);
router.get('/:id', missionController_1.getMissionById);
router.post('/', missionController_1.createMission);
router.put('/:id', missionController_1.updateMission);
router.delete('/:id', missionController_1.deleteMission);
router.get('/current/:droneId', missionController_1.getCurrentMission);
router.post('/:id/run', missionRunController.startMissionRun);
router.get('/running', (req, res, next) => {
    console.log('Route handler for /running called');
    missionRunController.getRunningMissions(req, res);
});
exports.default = router;
