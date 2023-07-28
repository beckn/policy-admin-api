//make a model for user seller

const { Document, model, Model, Schema } = require("mongoose");
const sellerSchema = new Schema({
    sellerId: {
        type: String,
        required: true,
    },
    sellerName: {
        type: String,
        required: true,
    },
    sellerEmail: {
        type: String,
        required: true,
    },
    sellerPhone: {
        type: String,
        required: true,
    },
    sellerPassword: {
        type: String,
        required: true,
    },
    sellerStatus: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
});

const Seller = model("Seller", sellerSchema);

module.exports = Seller;

