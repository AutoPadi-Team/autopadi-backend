const mongoose = require('mongoose');

const PremiumPaymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reference: {
        type: String,
    },
    premiumType: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('PremiumPayment', PremiumPaymentSchema);