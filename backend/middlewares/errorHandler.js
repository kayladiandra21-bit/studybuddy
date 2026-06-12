// middlewares/errorHandler.js
// Central error handler — any controller can just `next(err)`
// and this turns it into a clean JSON response.

function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  // Duplicate entry (e.g. registering an email that already exists)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'That record already exists.' });
  }

  const status = err.status || 500;
  res.status(status).json({
    message: err.status ? err.message : 'Something went wrong on the server.',
  });
}

module.exports = errorHandler;
