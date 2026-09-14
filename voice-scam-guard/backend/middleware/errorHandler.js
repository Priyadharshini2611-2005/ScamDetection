// Centralized error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  // Multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'FILE_TOO_LARGE',
      message: `File exceeds the maximum upload size of ${process.env.MAX_UPLOAD_MB || 20} MB.`,
    });
  }

  if (err.message && err.message.startsWith('Invalid file type')) {
    return res.status(415).json({
      error: 'INVALID_FILE_TYPE',
      message: err.message,
    });
  }

  console.error('Unhandled error:', err);

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.name || 'INTERNAL_ERROR',
    message: err.message || 'Something went wrong.',
  });
};

module.exports = errorHandler;
