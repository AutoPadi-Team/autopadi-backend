const mongoose = require('mongoose');

const mechanicServicePlanSchema = new mongoose.Schema({
    mechanic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    package:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminServicePlan',
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
}, {
    timestamps: true,
});
module.exports= mongoose.model('MechanicServicePlan', mechanicServicePlanSchema);