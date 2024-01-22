const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const variantSchema = new Schema({
    sku: {type: String},
    stock: {type: Number},
    variant_type: [{
        size: {type: String},
        color: {type: String},
    }],
    price: {
        type: Number, required: true, min: 0
    },
    images: [{ type: String, required: true }]
});

const ProductSchema = new Schema({
    product_name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    product_sku: { type: String, required: true, unique: true },
    variant: [variantSchema],
    is_deleted: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);