const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${statusCode}] ${message}`, err);

  res.status(statusCode).json({
    error: message,
    code: err.code || 'SERVER_ERROR',
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
