module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line
  console.error('Unhandled error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  // Map some known custom error messages to status codes
  if (err.message === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'Invalid credentials' });
  if (err.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'Email already exists' });
  if (err.message === 'NOT_FOUND') return res.status(404).json({ error: 'Not found' });
  res.status(status).json({ error: message });
};

