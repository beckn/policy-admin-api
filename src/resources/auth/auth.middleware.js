
const Seller = require("./auth.model");
const logger = require("../../libraries/logger");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const checkAuth = async (request, response, next) => {
    try {
        const token = request.cookies.token;
        if (!token) {
            return response.status(httpStatus.UNAUTHORIZED).send({
                message: "No token, authorization denied",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.seller = decoded;
        next();
    } catch (error) {
        logger.error(error);
        response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
            message: "Error while getting seller details",
        });
    }
}

module.exports = {
    checkAuth
}
