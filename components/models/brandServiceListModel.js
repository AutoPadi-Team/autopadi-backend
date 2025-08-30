const mongoose = require("mongoose");

const brandServiceListSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("BrandServiceList", brandServiceListSchema);