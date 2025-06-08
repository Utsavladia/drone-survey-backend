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
exports.getAvailableDrones = exports.deleteDrone = exports.updateDrone = exports.createDrone = exports.getDroneById = exports.getAllDrones = void 0;
const Drone_1 = __importDefault(require("../models/Drone"));
const getAllDrones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drones = yield Drone_1.default.find();
        res.json(drones);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching drones', error });
    }
});
exports.getAllDrones = getAllDrones;
const getDroneById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drone = yield Drone_1.default.findById(req.params.id);
        if (!drone) {
            return res.status(404).json({ message: 'Drone not found' });
        }
        res.json(drone);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching drone', error });
    }
});
exports.getDroneById = getDroneById;
const createDrone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drone = new Drone_1.default(req.body);
        const savedDrone = yield drone.save();
        res.status(201).json(savedDrone);
    }
    catch (error) {
        res.status(400).json({ message: 'Error creating drone', error });
    }
});
exports.createDrone = createDrone;
const updateDrone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drone = yield Drone_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!drone) {
            return res.status(404).json({ message: 'Drone not found' });
        }
        res.json(drone);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating drone', error });
    }
});
exports.updateDrone = updateDrone;
const deleteDrone = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drone = yield Drone_1.default.findByIdAndDelete(req.params.id);
        if (!drone) {
            return res.status(404).json({ message: 'Drone not found' });
        }
        res.json({ message: 'Drone deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting drone', error });
    }
});
exports.deleteDrone = deleteDrone;
const getAvailableDrones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drones = yield Drone_1.default.find({
            status: 'available',
            batteryLevel: { $gt: 20 } // Only return drones with sufficient battery
        });
        res.json(drones);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching available drones', error });
    }
});
exports.getAvailableDrones = getAvailableDrones;
