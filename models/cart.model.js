const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    cart_no: {
        type: Number
    },
    user_id: {
        type: Schema.Types.ObjectId, ref: "users"
    },
    shipping: {
        
    },
    discount: {
        type: Number
    },
    grand_total: {
        type: Number
    }
}, {
    timestamps: true
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;