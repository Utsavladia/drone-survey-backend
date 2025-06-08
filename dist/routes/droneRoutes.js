"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const droneController_1 = require("../controllers/droneController");
const router = express_1.default.Router();
router.get('/', droneController_1.getAllDrones);
router.get('/available', droneController_1.getAvailableDrones);
router.get('/:id', droneController_1.getDroneById);
router.post('/', droneController_1.createDrone);
router.put('/:id', droneController_1.updateDrone);
router.delete('/:id', droneController_1.deleteDrone);
exports.default = router;
