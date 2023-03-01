const logger = require("../logger");

let httpServerRef;

const errorHandler = {
	handleError: (errorToHandle) => {
		try {
			const appError = normalizeError(errorToHandle);
			logger.error(appError.message, appError);

			// fire any custom metric when handling error
			metricsExporter.fireMetric("error", { errorName: appError.name });

			// A common best practice is to crash when an unknown error (non-trusted) is being thrown
			if (!appError.isTrusted) {
				terminateHttpServerAndExit();
			}
		} catch (handlingError) {
			process.stdout.write(
				"The error handler failed, here are the handler failure and then the origin error that it tried to handle",
			);
			process.stdout.write(JSON.stringify(handlingError));
			process.stdout.write(JSON.stringify(errorToHandle));
			terminateHttpServerAndExit();
		}
	},
	listenToErrorEvents: (httpServer) => {
		httpServerRef = httpServer;
		process.on("uncaughtException", async (error) => {
			await errorHandler.handleError(error);
		});

		process.on("unhandledRejection", async (reason) => {
			await errorHandler.handleError(reason);
		});

		process.on("SIGTERM", async () => {
			logger.error(
				"App received SIGTERM event, try to gracefully close the server",
			);
			await terminateHttpServerAndExit();
		});

		process.on("SIGINT", async () => {
			logger.error(
				"App received SIGINT event, try to gracefully close the server",
			);
			await terminateHttpServerAndExit();
		});
	},
};

const terminateHttpServerAndExit = async () => {
	// maybe implement more complex logic here (like using 'http-terminator' library)
	if (httpServerRef) {
		await httpServerRef.close();
	}
	process.exit();
};

class AppError extends Error {
	constructor(name, message, cause, isTrusted = true, HTTPStatus = 500) {
		logger.error("App Error creating", {
			name,
			message,
			HTTPStatus,
			isTrusted,
			cause,
		});
		super(message);
	}
}

// The input might won't be 'AppError' or even 'Error' instance, the output of this function will be - AppError.
const normalizeError = (errorToHandle) => {
	if (errorToHandle instanceof AppError) {
		return errorToHandle;
	}
	if (errorToHandle instanceof Error) {
		const appError = new AppError(
			"general-error",
			errorToHandle.message,
			"unknown",
			false,
		);
		return appError;
	}

	// meaning it could be any type,
	const inputType = typeof errorToHandle;
	return new AppError(
		"general-error",
		`Error Handler received a none error instance with type - ${inputType}, value - ${util.inspect(
			errorToHandle,
		)}`,
		"unknown",
		false,
	);
};

const metricsExporter = {
	fireMetric: async (name, labels) => {
		logger.notice("In real production code I will really fire metrics", {
			name,
			labels,
		});
	},
};

module.exports = { errorHandler, metricsExporter, AppError };
