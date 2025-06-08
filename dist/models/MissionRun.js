"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionRun = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MissionRunSchema = new mongoose_1.Schema({
    mission_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Mission',
        required: true
    },
    drone_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Drone',
        required: true
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'failed'],
        default: 'in_progress'
    },
    started_at: {
        type: Date,
        default: Date.now
    },
    completed_at: {
        type: Date
    },
    missionSnapshot: {
        name: { type: String, required: true },
        description: { type: String, required: false },
        flightPath: [{
                lat: { type: Number, required: true },
                lng: { type: Number, required: true },
                altitude: { type: Number, required: true }
            }],
        site: { type: String, required: true },
        pattern: {
            type: String,
            enum: ['perimeter', 'crosshatch', 'custom'],
            required: true
        },
        parameters: {
            altitude: { type: Number, required: true },
            overlap: { type: Number, required: true },
            frequency: { type: Number, required: true },
            sensors: [{ type: String }]
        }
    }
}, {
    timestamps: true
});
// Add indexes for better query performance
MissionRunSchema.index({ status: 1, started_at: -1 });
MissionRunSchema.index({ mission_id: 1 });
MissionRunSchema.index({ drone_id: 1 });
exports.MissionRun = mongoose_1.default.model('MissionRun', MissionRunSchema);
