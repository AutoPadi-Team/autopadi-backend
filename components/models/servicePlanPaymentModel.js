const mongoose = require('mongoose');

const servicePlanPaymentSchema = new mongoose.Schema({
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServicePlanSubscription',
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mechanicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reference: {
        type: String,
    },
    paymentChannel: {
        type: String,
    },
    subscriptionType: {
        type: String,
    },
    subscriptionAmount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ServicePlanPayment', servicePlanPaymentSchema);