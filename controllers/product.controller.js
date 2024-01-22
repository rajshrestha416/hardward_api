const httpStatus = require("http-status");
const productModel = require("../models/product.model");
const Joi = require("joi");

class ProductController {
    // constructor(){
    //     this.counter = 1
    // }
    productValidationSchema = Joi.object({
        product_name: Joi.string().required(),
        category: Joi.string().required(),
        variant: Joi.array().items({
            sku: Joi.string().required(),
            stock: Joi.number().required(),
            price: Joi.number().min(10),
            variant_type: Joi.array()
        })
    });


    skuGenerator = async(productName) => {
        const formattedName = productName.replace(/\s/g, '_'); // Replace spaces with underscores
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        const sku = formattedName.toUpperCase() + '_' + randomNum

        const checkSKU = await productModel.findOne({
            sku,
            is_deleted: false,
        });
        if(checkSKU) await this.skuGenerator(productName)

        return sku;
    };

    addProduct = async (req, res) => {
        try {
            let { product_name, category, variant } = req.body;

            const { error } = this.productValidationSchema.validate(req.body);
            
            if (error) {
                return res.status(httpStatus.CONFLICT).json({
                    success: false,
                    msg: error.message
                });
            }
            
            const checkProduct = await productModel.findOne({
                product_name,
                is_deleted: false,
            });
            
            
            if (checkProduct) {
                return res.status(httpStatus.CONFLICT).json({
                    success: false,
                    msg: "Product Already Exits!!"
                });
            }
            const product_sku = await this.skuGenerator(product_name);

            const product = await productModel.create({
                product_name, product_sku, category, variant
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