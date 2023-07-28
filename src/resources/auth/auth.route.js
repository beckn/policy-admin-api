const express = require("express");
const Seller = require("./auth.model");
const logger = require("../../libraries/logger");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../email/nodemailer");
const { checkAuth } = require("./auth.middleware");

require("dotenv").config();
const sellerResponse = ({
    sellerId,
    sellerName,
    sellerEmail,
    sellerPhone,
    sellerPassword,
    sellerStatus,
}) => ({
    sellerId,
    sellerName,
    sellerEmail,
    sellerPhone,
    sellerPassword,
    sellerStatus,
});

function defineSellerRoutes(expressApp) {
    const sellerRouter = express.Router();
    sellerRouter.post("/register", (request, response, next) => {
        const { sellerName, sellerPassword } = request.body.seller;
        if (
            sellerName &&
            typeof sellerName === "string" &&
            sellerName.length >= 3 &&
            sellerName.length <= 50
        ) {
            // Validate strong password
            const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
            if (sellerPassword && strongPasswordRegex.test(sellerPassword)) {
                next();
            } else {
                response.status(httpStatus.BAD_REQUEST).send({
                    message: "Invalid sellerPassword. It must be at least 8 characters long and contain at least one letter, one number, and one special character (@$!%*#?&).",
                });
            }
        } else {
            response.status(httpStatus.BAD_REQUEST).send({
                message: "Invalid sellerName. It must be a string with a length between 3 and 50 characters.",
            });
        }
    },
        async (request, response) => {
            try {
                const {
                    sellerName,
                    sellerEmail,
                    sellerPhone,
                    sellerPassword,
                } = request.body.seller;
                const sellerId = uuidv4();
                const sellerExists = await Seller.findOne({
                    sellerEmail,
                });
                if (sellerExists) {
                    return response.status(httpStatus.BAD_REQUEST).send({
                        message: "Seller already exists.",
                    });
                }
                const sellerStatus = "inactive";
                const seller = new Seller({
                    sellerId,
                    sellerName,
                    sellerStatus,
                    sellerEmail,
                    sellerPhone,
                    sellerPassword,
                });
                const salt = await bcrypt.genSalt(10);
                seller.sellerPassword = await bcrypt.hash(sellerPassword, salt);
                const payload = sellerResponse(seller)
                const token = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: 360000,
                });
                //savee token in cookie
                response.cookie("token", token, { expiresIn: 360000 });
                //send email
                await sendEmail(sellerEmail, sellerId);
                await seller.save();
                response.status(httpStatus.CREATED).send({
                    token,
                    seller: sellerResponse({
                        sellerId: seller.sellerId,
                        sellerStatus: seller.sellerStatus,
                        sellerEmail: seller.sellerEmail,
                        sellerPhone: seller.sellerPhone,
                        sellerPassword: seller.sellerPassword,
                    }),
                });
            } catch (error) {
                logger.error(error);
                response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                    message: "Error while creating seller",
                });
            }
        }
    );

    sellerRouter.post("/send-verification-email", checkAuth, async (request, response) => {
        const { sellerEmail } = request.seller;
        try {
            //check if seller exists
            const seller = await Seller.findOne({
                sellerEmail,
            });
            if (!seller) {
                response.status(httpStatus.BAD_REQUEST).send({
                    message: "Seller does not exist.",
                });
            }
            //send email
            await sendEmail(sellerEmail, seller.sellerId);
            response.status(httpStatus.OK).send({
                message: "Email sent successfully.",
            });
        } catch (error) {
            logger.error(error);
            response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Error while sending email",
            });
        }
    });

    sellerRouter.get("/verify/:verificationToken", async (request, response) => {
        const { verificationToken } = request.params
        try {
            const payload = jwt.verify(verificationToken, process.env.JWT_ACCOUNT_ACTIVATION);
            //check if seller exists
            const seller = await Seller.findOne({
                sellerId: payload.seller.id,
            });
            if (!seller) {
                response.status(httpStatus.BAD_REQUEST).send({
                    message: "Seller does not exist.",
                });
            }
            //check if token matches
            if (payload.seller.id !== seller.sellerId) {
                response.status(httpStatus.BAD_REQUEST).send({
                    message: "Invalid token.",
                });
            }
            seller.sellerStatus = "active";
            const sellerResponse = await seller.save();
            // response.redirect(process.env.CLIENT_URL);
            response.status(httpStatus.OK).send({
                message: "Seller verified successfully.",
                sellerResponse
            });
        }
        catch (error) {
            logger.error(error);
            response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                message: error.message,
            });
        }
    });

    sellerRouter.post("/login", async (request, response) => {
        try {
            const { sellerEmail, sellerPassword } = request.body.seller;
            Seller.findOne({ sellerEmail }, async (error, seller) => {
                if (error) {
                    logger.error(error);
                    response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                        message: "Error while logging in",
                    });
                } else if (!seller) {
                    response.status(httpStatus.NOT_FOUND).send({
                        message: "Seller not found",
                    });
                } else {
                    // Check if password is correct
                    const isMatch = await bcrypt.compare(
                        sellerPassword,
                        seller.sellerPassword
                    );
                    if (!isMatch) {
                        response.status(httpStatus.BAD_REQUEST).send({
                            message: "Incorrect password",
                        });
                    } else {
                        const payload = sellerResponse(seller);
                        const token = jwt.sign(payload, process.env.JWT_SECRET, {
                            expiresIn: 360000,
                        });
                        //savee token in cookie
                response.cookie("token", token, { expiresIn: 360000 });
                        response.status(httpStatus.OK).send({
                            token,
                            seller: sellerResponse({
                                sellerId: seller.sellerId,
                                sellerStatus: seller.sellerStatus,
                                sellerEmail: seller.sellerEmail,
                                sellerPhone: seller.sellerPhone,
                                sellerPassword: seller.sellerPassword,
                            }),
                        });
                    }
                }
            });
        } catch (error) {
            logger.error(error);
            response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Error while logging in",
            });
        }
    });

    sellerRouter.post("/logout", async (request, response) => {
        try {
            response.clearCookie("token");
            response.status(httpStatus.OK).send({
                message: "Logged out successfully",
            });
        } catch (error) {
            logger.error(error);
            response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Error while logging out",
            });
        }
    });

    //get seller profile
    sellerRouter.get("/profile", checkAuth , async (request, response) => {
        try { 
            const seller = await Seller.findOne({
                sellerId: request.seller.sellerId,
            });
            if (!seller) {
                response.status(httpStatus.BAD_REQUEST).send({
                    message: "Seller does not exist.",
                });
            }
            response.status(httpStatus.OK).send({
                seller: sellerResponse(seller),
            });

        } catch (error) {
            logger.error(error);
            response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Error while getting seller profile",
            });
        }
    });

    //check email verification
    sellerRouter.get("/check-email-verification", checkAuth , async (request, response) => {
        try {
            const seller = await Seller.findOne({
                sellerId: request.seller.sellerId,
            }).select("sellerStatus");
            if (!seller) {
                response.status(httpStatus.BAD_REQUEST).send({
                    message: "Seller does not exist.",
                });
            }
            if (seller.sellerStatus === "active") {
                response.status(httpStatus.OK).send({
                    message: "Email verified",
                });
            }
            else {
                response.status(httpStatus.UNAUTHORIZED).send({
                    message: "Email not verified",
                });
            }
        } catch (error) {
            logger.error(error);
            response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Error while getting seller profile",
            });
        }
    });

    //update seller profile
    sellerRouter.put("/profile", checkAuth , async (request, response) => {
        try {
            const { sellerName, sellerPhone } = request.body.seller;
            const seller = await Seller.findOne({
                sellerId: request.seller.sellerId,
            });
            if (!seller) {
                response.status(httpStatus.BAD_REQUEST).send({
                    message: "Seller does not exist.",
                });
            }
            seller.sellerName = sellerName;
            seller.sellerPhone = sellerPhone;
            await seller.save();
            response.status(httpStatus.OK).send({
                seller: sellerResponse(seller),
            });
        } catch (error) {
            logger.error(error);
            response.status(httpStatus.INTERNAL_SERVER_ERROR).send({
                message: "Error while updating seller profile",
            });
        }
    });



    expressApp.use("/seller", sellerRouter);
};

module.exports = defineSellerRoutes;
