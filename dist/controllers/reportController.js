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
exports.getReportByMission = exports.getReportById = exports.getAllReports = void 0;
const SurveyReport_1 = __importDefault(require("../models/SurveyReport"));
const getAllReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reports = yield SurveyReport_1.default.find();
        res.json(reports);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});
exports.getAllReports = getAllReports;
const getReportById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield SurveyReport_1.default.findById(req.params.id);
        if (!report)
            return res.status(404).json({ error: 'Report not found' });
        res.json(report);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});
exports.getReportById = getReportById;
const getReportByMission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield SurveyReport_1.default.findOne({ mission: req.params.missionId });
        if (!report)
            return res.status(404).json({ error: 'Report not found for this mission' });
        res.json(report);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});
exports.getReportByMission = getReportByMission;
