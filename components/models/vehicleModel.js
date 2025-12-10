const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    image: {
        type: String,
    },
    carBrand: {
        type: String,
        required: true,
    },
    carModel: {
        type: String,
        required: true,
    },
    carYear: {
        type: String,
        required: true,
    },
    carLicensePlateNumber: {
        type: String,
        required: true,
    },
    carColor: {
        type: String,
        default: "none",
    },
}, 
{
    timestamps: true
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
