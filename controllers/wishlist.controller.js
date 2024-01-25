
const httpStatus = require("http-status");
const wishlistModel = require("../models/wishlist.model")

class WishListController {

    addRemoveWishList = async (req, res) => {
        try {
            let wishlist = await wishlistModel.findOne({
                product: req.params.product,
                user: req.user._id
            })
            if(wishlist) {
                await wishlistModel.findByIdAndDelete(wishlist._id)
            }else{
                wishlist = new wishlistModel({
                    user: req.user._id,
                    product: req.params.product
                })
                wishlist.save()
            }
            wishlist = wishlist.populate({
                path: "user"
            }).populate({
                path: "product"
            })
            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Wishlist updated",
                data: wishlist
            })
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            })
        }
    }

    getWishList = async (req, res) => {
        try {
            const { page = 1, size = 10, sort = {_id:-1} } = req.query;
            let wishlist = await wishlistModel.find({
                user: req.user._id
            }).sort(sort).limit(size).skip((page-1)*size)

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "My Wishlist",
                data: wishlist
            })
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            })
        }
    }
}