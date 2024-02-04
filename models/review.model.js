const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    user: {
        type: Schema.Types.ObjectId, ref: "User"
    },
    rating: {
        type: Number
    },
    message: {
        type: String
    },
    updatedAt: {
        type: Date, default: Date.now()
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', ReviewSchema);