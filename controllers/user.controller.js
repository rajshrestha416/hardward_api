const Joi = require("joi");
const httpStatus = require("http-status");
const userModel = require("../models/user.model");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

class UserController {
    userValidationSchema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        contact: Joi.number().required(),
        address: Joi.string().required(),
    });

    loginValidationSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    login = async (req, res, next) => {
        try {
            const { error } = this.loginValidationSchema.validate(req.body);
            if (error) {
                console.log("error", error);
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    msg: error.message
                });
            }

            const user = await userModel.findOne({
                email: req.body.email
            }).lean();
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "User Not Registered!!"
                });
            }

            // check if password is valid
            const checkPassword = await bcrypt.compare(req.body.password, user.password);
            if (!checkPassword) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "Email or Password Incorrect!!"
                });
            }

            // generate and send a JWT token for the authenticated user
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

            const { password, __v, ...data } = user;

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Login Success!!",
                data: {
                    ...(data),
                    token
                }
            });
        } catch (error) {
            console.log("error", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    register = async (req, res, next) => {
        try {
            const { error } = this.userValidationSchema.validate(req.body);
            if (error) {
                return res.status(httpStatus.BAD_REQUEST).json({
                    success: false,
                    msg: error.message
                });
            }

            const checkUserExist = await userModel.findOne({
                email: req.body.email
            });
            if (checkUserExist) {
                return res.status(httpStatus.CONFLICT).json({
                    success: false,
                    msg: "User Already Exists!!"
                });
            }

            bcrypt.genSalt(10, async (error, salt) => {
                bcrypt.hash(req.body.password, salt, async (error, hash) => {
                    const user = await userModel.create({ ...req.body, password: hash });
                    if (user) {
                        return res.status(httpStatus.OK).json({
                            status: true,
                            msg: 'Registration Completed'
                        });
                    } else {
                        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                            success: false,
                            msg: "Failed to Register!!"
                        });
                    }
                });
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    allUser = async (req, res, next) => {
        try {
            const {page=1, size=10, sort} = req.query
            const users = await userModel.find({
                is_deleted: false
            }).select("firstname lastname email contact address").skip((page-1) * size).limit(size).sort(sort)

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "Users!!",
                data : users
            });

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    };

    updateProfile = async (req, res, next) => {
        try {
            const id = req.params.id
            const user = await userModel.findById(id)
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "User Not Registered!!"
                });
            }

            await userModel.findByIdAndUpdate(
                id,
                req.body,
                {new: true}
            )

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "User Profile Updated!!"
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    }

    deleteUser = async (req, res, next) => {
        try {
            const id = req.params.id
            const user = await userModel.findById(id)
            if (!user) {
                return res.status(httpStatus.NOT_FOUND).json({
                    success: false,
                    msg: "User Not Registered!!"
                });
            }

            user.is_deleted = true
            await user.save()

            return res.status(httpStatus.OK).json({
                success: true,
                msg: "User Deleted!!"
            });
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                msg: "Something Went Wrong!!"
            });
        }
    }
    
}

module.exports = UserController;