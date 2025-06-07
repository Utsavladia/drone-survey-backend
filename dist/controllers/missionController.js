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
exports.getCurrentMission = exports.deleteMission = exports.updateMission = exports.createMission = exports.getMissionById = exports.getAllMissions = void 0;
const Mission_1 = __importDefault(require("../models/Mission"));
const mongoose_1 = __importDefault(require("mongoose"));
const validateMissionData = (data) => {
    var _a, _b;
    const errors = [];
    // Required fields
    if (!((_a = data.name) === null || _a === void 0 ? void 0 : _a.trim()))
        errors.push({ field: 'name', message: 'Name is required' });
    if (!((_b = data.site) === null || _b === void 0 ? void 0 : _b.trim()))
        errors.push({ field: 'site', message: 'Site is required' });
    if (!data.assignedDrone)
        errors.push({ field: 'assignedDrone', message: 'Drone assignment is required' });
    // Validate flight path
    if (!Array.isArray(data.flightPath) || data.flightPath.length < 2) {
        errors.push({ field: 'flightPath', message: 'At least 2 waypoints are required' });
    }
    else {
        data.flightPath.forEach((waypoint, index) => {
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
const getAllMissions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const missions = yield Mission_1.default.find();
        res.json(missions);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch missions' });
    }
});
exports.getAllMissions = getAllMissions;
const getMissionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mission = yield Mission_1.default.findById(req.params.id);
        if (!mission)
            return res.status(404).json({ error: 'Mission not found' });
        res.json(mission);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch mission' });
    }
});
exports.getMissionById = getMissionById;
const createMission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        let droneId;
        try {
            droneId = new mongoose_1.default.Types.ObjectId(assignedDrone);
            console.log('Converted droneId:', droneId);
        }
        catch (error) {
            console.log('Invalid droneId format:', error);
            return res.status(400).json({
                message: 'Invalid drone ID format',
                field: 'assignedDrone'
            });
        }
        const mission = new Mission_1.default({
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
        const savedMission = yield mission.save();
        console.log('Mission saved successfully:', savedMission._id);
        res.status(201).json(savedMission);
    }
    catch (error) {
        console.error('Error creating mission:', error);
        res.status(500).json({
            message: 'Error creating mission',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.createMission = createMission;
const updateMission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mission = yield Mission_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!mission)
            return res.status(404).json({ error: 'Mission not found' });
        res.json(mission);
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to update mission' });
    }
});
exports.updateMission = updateMission;
const deleteMission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mission = yield Mission_1.default.findByIdAndDelete(req.params.id);
        if (!mission)
            return res.status(404).json({ error: 'Mission not found' });
        res.json({ message: 'Mission deleted' });
    }
    catch (err) {
        res.status(400).json({ error: 'Failed to delete mission' });
    }
});
exports.deleteMission = deleteMission;
const getCurrentMission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { droneId } = req.params;
        const mission = yield Mission_1.default.findOne({
            assignedDrone: droneId,
            status: { $in: ['in-progress', 'paused'] }
        }).sort({ updatedAt: -1 });
        if (!mission)
            return res.status(404).json({ error: 'No current mission' });
        res.json(mission);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch current mission' });
    }
});
exports.getCurrentMission = getCurrentMission;
