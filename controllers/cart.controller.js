const httpStatus = require("http-status");
const productModel = require("../models/product.model");
const Joi = require("joi");
const cartItemModel = require("../models/cartItem.model");
const cartModel = require("../models/cart.model");
const UserController = require("../controllers/user.controller");
const userController = new UserController();

class OrderController {
    // constructor(){
    //     this.counter = 1
    // }
    orderValidationController = Joi.object({
        item: Joi.string().required(),
        quantity: Joi.number().required(),
        variant: Joi.string().required()
    });

    addToCart = async (req, res) => {
        try {
            let { item, quantity, variant } = req.body;

            const { error } = this.orderValidationController.validate(req.body);

            if (error) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    msg: error.message
                });
            }

            //check Stock
            const checkProduct = await productModel.findOne({
                _id: item,
                "variant.sku": variant
            });

            if (!checkProduct) {
                return res.status(httpStatus.CONFLICT).json({
                    success: false,
                    msg: "Product Doesn't Exists!!"
                });
            }

            const _variant = checkProduct.variant.find(ele => ele.sku === variant);
            
            console.log("_variant", _variant);
            if (_variant.stock < quantity) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    msg: "Out of Stock!!"
                });
            }
            _variant.stock -= quantity;

            //get my cart
            const cart = await cartModel.findOne({
                user_id: req.user._id,
                status: "CART"
            });

            //check if item exist in cart
            let order = await cartItemModel.findOne({
                cart: cart._id,
                variant: _variant.sku
            });
            console.log("checkItem", order)
            if(order){
                order.quantity += quantity
                await order.save()
            }else{
                order = await cartItemModel.create({
                    item, variant, quantity, price: _variant.price, cart: cart._id
                });
                
                if (!order) {
                    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        msg: "Something Went Wrong!!"
                    });
                }
            }

            //handle cart info
            cart.total += (_variant.price * quantity);
            cart.grand_total = cart.total - cart.discount;
            await cart.save();
            await _variant.save();
            await checkProduct.save();

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Order Added to cart",
                data: {
                    cart,
                    cartItem: order
                }
            });
        } catch (error) {
            console.log("error", error)
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    getMyCart = async (req, res) => {
        try {
            //get my cart
            const cart = await cartModel.findOne({
                user_id: req.user._id,
                status: "CART"
            }).select("_id cart_no user_id total discount grand_total status").populate({
                path: "user_id",
                select: "firstname lastname email contact address "
            });

            const cartItems = await cartItemModel.find({
                cart: cart._id,
                status: "CART"
            }).select("item variant price quantity ");

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "My Cart!!",
                data: {
                    cart,
                    cartItems
                }
            });
        } catch (error) {
            console.log("err", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    removeItems = async (req, res) => {
        try {
            const { item } = req.body.item;
            const cartItem = await cartItemModel.findOne({
                item: item,
                status: "CART",
                is_active: true
            });
            if (!cartItem) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "Item Not Found!!"
                });
            }

            cartItem.status = "REMOVED";
            await cartItem.save();

            //update Cart
            const cart = await cartModel.findOne({
                _id: cartItem.cart
            });
            if (!cart) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "Cart Not Found!!"
                });
            }

            //handle cart info
            cart.total -= (cartItem.price * cartItem.quantity);
            cart.grand_total = cart.total - cart.discount;
            await cart.save();

            //manage stock 
            await productModel.updateOne({ _id: item, "variant.sku": cartItem.variant }, {
                $inc: {
                    "variant.$.stock": cartItem.quantity
                }
            });

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Cart Item Removed!!"
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    checkout = async (req, res) => {
        try {
            const { cart_id } = req.params;

            //Update CartItem Status
            const cartItems = await cartItemModel.updateMany({
                cart: cart_id
            },
                {
                    status: "ORDER"
                });

            //Update Cart Status
            const cart = await cartModel.findOneAndUpdate({ _id: cart_id }, {
                status: "ORDER"
            });

            //create 
            await userController.createCart(cart.user_id);

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Checkout Completed!!"
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };
}

module.exports = OrderController;