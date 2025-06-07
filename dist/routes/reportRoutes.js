"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../controllers/reportController");
const router = express_1.default.Router();
router.get('/', reportController_1.getAllReports);
router.get('/:id', reportController_1.getReportById);
router.get('/mission/:missionId', reportController_1.getReportByMission);
exports.default = router;
