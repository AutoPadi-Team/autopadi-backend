const mongoose = require("mongoose");

const businessProfileSchema = mongoose.Schema({
    mechanicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    businessName: {
        type: String,
        required: true,
    },
    businessPhoneNumber: {
        type: String,
    },
    businessEmail: {
        type: String,
    },
    mechanicType: {
        type: String,
        required: true,
    },
    aboutBusiness: {
        type: String,
    },
    yearsOfExperience: {
        type: String,
        required: true,
    },
    brandServiced: {
        type: [String],
        required: true,
    },
    certificate: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    servicesOffered: {
        type: [String],
        required: true,
    },
    picture: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: [String],
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);