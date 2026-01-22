const mongoose = require("mongoose");

const serviceHistorySchema = new mongoose.Schema({
    mechanicId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    driverId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    note: {
        type: String,
    },
    amount: {
        type: Number,
    },
},{
    timestamps: true,
});
module.exports = mongoose.model("serviceHistory", serviceHistorySchema);