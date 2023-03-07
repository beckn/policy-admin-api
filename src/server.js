const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { randomUUID } = require("crypto");

const helmet = require("helmet");
const httpStatus = require("http-status");

const pinoHTTP = require("pino-http");

const mongoose = require("mongoose");

const logger = require("./libraries/logger");
const { errorHandler, AppError } = require("./libraries/errorHandling");
const config =require("./config") ;

const defineHealthRoutes = require("./resources/health");
const definePolicyRoutes = require("./resources/policy");

async function startWebServer() {
	// EventEmitter memory leak detected
	process.setMaxListeners(Infinity);

	const expressApp = express();

	expressApp.use(helmet());
	expressApp.use(express.urlencoded({ extended: true, limit: "50mb" }));
	expressApp.use(express.json({ limit: "50mb" }));
	expressApp.use(cookieParser());

	expressApp.use(function (request, response, next) {
		const id = request.get("x-request-id") || randomUUID();

		logger.fatal(`new request`);
		logger.fatal(`url ${request.url}`);
		logger.fatal(`method ${request.method}`);
		logger.fatal(`x-request-id ${id}`);

		request.headers["x-request-id"] = id;
		next();
	});

	expressApp.use(
		cors({
			methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
			origin: "*",
			optionsSuccessStatus: 201,
			credentials: true,
		  }),
	);

	expressApp.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		next();
	  });


	// routes
	defineHealthRoutes(expressApp);
	definePolicyRoutes(expressApp);

	// send back a 404 error for any unknown api request
	expressApp.use((req, res, next) => {
		
		res.status(httpStatus.NOT_FOUND).send({
            code: "404",
            message: "Endpoint doesn't exits",
            data: req.method,
            type: "Not found error",
            path: req.url
        })
		// try {
		// 	// throw new AppError(
		// 	// 	"route not found",
		// 	// 	"route not found",
		// 	// 	"route not found",
		// 	// 	true,
		// 	// 	httpStatus.NOT_FOUND,
		// 	// );
		// } catch (error) {
		// 	next(error);
		// }
	});

	// handleRouteErrors(expressApp);
	const APIAddress = await openConnection(expressApp);
	return APIAddress;
}

const openConnection = (expressApp) => {
	return new Promise((resolve) => {
		// Allow a dynamic port (port 0 = ephemeral) so multiple webservers can be used in multi-process testin

		const webServerPort = 8080;
		logger.info(`Server is about to listen to port ${webServerPort}`);
		connection = expressApp.listen(webServerPort, () => {
			errorHandler.listenToErrorEvents(connection);
			// TODO: close worker if server closes
			mongoose
				.connect((config.DATABASE_URL),
					
					//"mongodb://beckn:becknPasS41@api.policy-admin.becknprotocol.io:27017/policyAdmin?authSource=admin",
					{
						autoCreate: true,
					},
				)
				.then(() => {
					logger.info("Mongodb connected");
					resolve(connection.address());
				})
				.catch((error) => {
					process.stdout.write(JSON.stringify(error));
					errorHandler.handleError(error);
				});
		});
	});
};

module.exports = {
	startWebServer,
};
