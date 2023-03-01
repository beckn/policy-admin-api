const express = require("express");
const httpStatus = require("http-status");
const logger = require("../../libraries/logger");

function defineHealthRoutes(expressApp) {
	const healthRouter = express.Router();

	healthRouter.get("/", (req, res) => {
		try {
			const healthCheck = {
				uptime: process.uptime(),
				responseTime: process.hrtime(),
				message: "OK",
				date: new Date(),
			};

			logger.fatal(`request completed ${req.headers["x-request-id"]}`);
			res.status(httpStatus.OK).send(healthCheck);
			return undefined;
		} catch (error) {
			logger.error(error);
			res
				.status(httpStatus.INTERNAL_SERVER_ERROR)
				.send(httpStatus.INTERNAL_SERVER_ERROR);
			return undefined;
		}
	});

	expressApp.use("/api/v1/health", healthRouter);
}

module.exports = defineHealthRoutes;
