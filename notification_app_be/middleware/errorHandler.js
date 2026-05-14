const Log = require("../../logging_middleware/logger");

/**
 * Error handling middleware
 * Logs all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  const errorId = `ERROR_${Date.now()}`;

  // Log error details
  Log(
    "backend",
    "fatal",
    "middleware",
    `Error occurred: ${errorId} - ${err.message} at ${req.method} ${req.path}`
  ).catch(console.error);

  // Determine error status
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    success: false,
    message,
    errorId,
    timestamp: new Date().toISOString()
  });
};

/**
 * Request logging middleware
 * Logs incoming requests
 */
const requestLogger = async (req, res, next) => {
  const start = Date.now();

  // Log incoming request
  await Log(
    "backend",
    "debug",
    "middleware",
    `Incoming request: ${req.method} ${req.path} from ${req.ip}`
  );

  // Capture original res.json
  const originalJson = res.json;

  // Override res.json to log response
  res.json = function(data) {
    const duration = Date.now() - start;
    const status = res.statusCode;

    Log(
      "backend",
      status >= 400 ? "warn" : "info",
      "middleware",
      `Response sent: ${req.method} ${req.path} - Status: ${status} - Duration: ${duration}ms`
    ).catch(console.error);

    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  errorHandler,
  requestLogger
};
