const pino = require("pino");
const lightFormat = require("date-fns/lightFormat");

const streams = [
	{ stream: process.stdout },
	// { stream: pino.destination(`${__dirname}/combined.txt`) },
];

module.exports = pino(
	{
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				sync: true,
				translateTime: "SYS:standard",
			},
		},
		formatters: {
			level: (label) => {
				return { level: label };
			},
		},
		timestamp: () =>
			`, "time":"${lightFormat(new Date(), "dd:MM:yyyy-hh:mm:SS")}"`,
	},
	pino.multistream(streams, {
		dedupe: true,
	}),
);

// logger.fatal("fatal");
// logger.error("error");
// logger.warn("warn");
// logger.info("info");
