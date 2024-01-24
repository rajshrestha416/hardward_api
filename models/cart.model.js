const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    cart_no: {
        type: Number
    },
    user_id: {
        type: Schema.Types.ObjectId, ref: "User"
    },
    total: {
        type: Number, default: 0
    },
    shipping_address: {
        type: String
    },
    discount: {
        type: Number, default: 0
    },
    grand_total: {
        type: Number, default: 0
    },
    is_active: {
        type: Boolean, default: true
    },
    status: {
        type: String, enum: [
            "CART", "ORDER", "DELIVERED", "CANCELLED", "REMOVED" 
        ],
        default: "CART"
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;