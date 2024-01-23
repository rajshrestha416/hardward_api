const httpStatus = require("http-status");
const productModel = require("../models/product.model");
const Joi = require("joi");
const orderModel = require("../models/order.model");

class OrderController {
    // constructor(){
    //     this.counter = 1
    // }
    orderValidationController = Joi.object({
        item: Joi.string().required(),
        quantity: Joi.string().required(),
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
            
            const checkProduct = await productModel.findOne({
                _id:item,
                "variant.sku": variant
            });
            
            if (!checkProduct) {
                return res.status(httpStatus.CONFLICT).json({
                    success: false,
                    msg: "Product Doesn't Exists!!"
                });
            }

            const product = await orderModel.create({
                item, variant, quantity
            });

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Category Added",
                data: product
            });
        } catch (error) {
            console.log("error", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    getProducts = async (req, res) => {
        try {
            const { page = 1, size = 10, sort = {_id:-1} } = req.query;
            const products = await productModel.find({
                is_deleted: false
            }).select("product_ name category product_sku variant").skip((page - 1) * size).limit(size).sort(sort);

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Products!!",
                data: products
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    getProduct = async (req, res) => {
        try {
            const sku = req.params.sku;
            const product = await productModel.findOne({
                product_sku: sku
            }).select("product_name category product_sku variant");
            if (!product) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "Product Not Found!!"
                });
            }
            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Product!!",
                data: product
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    updateProduct = async (req, res) => {
        try {
            const id = req.params.id;

            const product = await productModel.findById(id);
            if (!product) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "Product Not Found!!"
                });
            }

            if(req.body.product_name !== product.product_name){
                req.body.product_sku = await this.skuGenerator(req.body.product_name)
            }

            await productModel.findByIdAndUpdate(
                id,
                req.body,
                { new: true }
            );
            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Product Updated!!"
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    deleteProduct = async (req, res) => {
        try {
            const id = req.params.id;
            const product = await productModel.findById(id);
            if (!product) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "Product Not Found!!"
                });
            }

            product.is_deleted = true;
            await product.save();

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Product Deleted!!"
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };
}

module.exports = ProductController;