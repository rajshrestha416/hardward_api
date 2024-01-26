const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const userModel = require('../models/user.model');

const decodeToken = (authorization) => {
  try {
    const token = authorization.split(' ')[1];
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const getUser = async (userId) => {
  try {
    return await userModel.findById(userId).lean();
  } catch (error) {
    return null;
  }
};

const handleUnauthorizedAccess = (res) => {
  return res
    .status(httpStatus.UNAUTHORIZED)
    .json({ success: false, message: 'Unauthorized access' });
};

const verifyUser = async (req, res, next) => {
  if (req.headers.authorization === undefined) {
    return handleUnauthorizedAccess(res);
  }
  let decodedResult = decodeToken(req.headers.authorization);
  if (decodedResult == null || decodedResult == undefined)
    return handleUnauthorizedAccess(res);

  console.log('user', decodedResult.userId);
  let userData = await getUser(decodedResult.userId);
  if (userData == null) return handleUnauthorizedAccess(res);
  req.user = userData;
  next();
};

const verifyAuthorization = (req, res, next) => {
  if (req.user.role === 'admin') {
    next();
  }
  return res
    .status(httpStatus.UNAUTHORIZED)
    .json({ success: false, message: 'Unauthorized access' });
};

module.exports = { verifyUser, verifyAuthorization };
