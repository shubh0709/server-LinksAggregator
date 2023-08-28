import winston from "winston";
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

function logFunctionCall(fn: any, args: any) {
  logger.info(
    `Calling function ${fn.name} with arguments: ${JSON.stringify(args)}`
  );
}

function logFunctionResponse(fn: any, response: any) {
  logger.info(`Function ${fn.name} returned: ${JSON.stringify(response)}`);
}

export async function withLogging(fn: any) {
  if (process.env.NODE_ENV === "production") {
    return fn;
  } else {
    return async function (...args: any) {
      logFunctionCall(fn, args);
      try {
        let result = fn(...args);
        if (result instanceof Promise) result = await result;
        logFunctionResponse(fn, result);
        return result;
      } catch (error: any) {
        logger.error(
          `Function ${fn.name} encountered an error: ${error.message}`
        );
        if (args.next) {
          args.next(error);
          return;
        }
        throw error;
      }
    };
  }
}
