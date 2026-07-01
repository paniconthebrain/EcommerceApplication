function normalize(err) {
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return { statusCode: 409, message: 'This action was blocked because other records still reference it. Remove or reassign those first.' };
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return { statusCode: 409, message: 'A record with that value already exists.' };
  }
  if (err.name === 'SequelizeValidationError') {
    return { statusCode: 400, message: err.errors?.map(e => e.message).join(', ') || 'Validation failed.' };
  }
  return { statusCode: err.statusCode || 500, message: err.message || 'Internal Server Error' };
}

const errorHandler = (err, req, res, next) => {
  const { statusCode, message } = normalize(err);

  console.error(`[${statusCode}] ${message}`, err);

  res.status(statusCode).json({
    error: message,
    code: err.code || 'SERVER_ERROR',
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
