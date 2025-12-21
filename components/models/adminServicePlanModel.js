const mongoose = require('mongoose');

const adminServicePlanSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    lowPrice: {
        type: Number,
        required: true,
    },
    highPrice: {
        type: Number,
        required: true,
    },
    benefits: [{
        type: String,
        required: true,
    }],
    bonuses: [{
        type: String,
        default: ["none"]
    }],
    terms: [{
        type: String,
        required: true,
    }],
}, {
    timestamps: true,
});

module.exports= mongoose.model('AdminServicePlan', adminServicePlanSchema);