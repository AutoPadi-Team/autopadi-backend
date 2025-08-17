const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    Image: {
        type: String,
        default: ""
    },

});

module.exports = mongoose.model("vehicles", vehicleSchema);