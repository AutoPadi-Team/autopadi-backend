const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    referralCode: {
        type: String,
    },
    location: {
        lot: {
            type: Number,  
        },
        lat: {
            type: Number,
        }
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['driver', 'mechanic', 'admin'],
        default: 'driver',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", usersSchema);