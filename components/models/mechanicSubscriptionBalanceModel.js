import mongoose from 'mongoose';

const mechanicSubscriptionBalanceSchema = new mongoose.Schema({
    mechanicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    balanceAmount: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
}); 

module.exports = mongoose.model('MechanicSubscriptionBalance', mechanicSubscriptionBalanceSchema);