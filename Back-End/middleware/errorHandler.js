const ERROR_CODES = require('../constants/errorCodes');

const ERROR_RESPONSES = {
  [ERROR_CODES.EMAIL_EXISTS]: { status: 409, message: 'Email already exists' },
  [ERROR_CODES.EMAIL_NOT_VERIFIED]: { status: 403, message: 'Email is not verified' },
  [ERROR_CODES.EMAIL_VERIFICATION_EXPIRED]: { status: 400, message: 'Email verification link has expired' },
  [ERROR_CODES.EXERCISE_NOT_FOUND]: { status: 404, message: 'Exercise not found' },
  [ERROR_CODES.INVALID_EMAIL_VERIFICATION_TOKEN]: { status: 400, message: 'Invalid email verification token' },
  [ERROR_CODES.INVALID_CREDENTIALS]: { status: 401, message: 'Invalid credentials' },
  [ERROR_CODES.INVALID_REFRESH]: { status: 401, message: 'Invalid refresh token' },
  [ERROR_CODES.NOT_FOUND]: { status: 404, message: 'Not found' },
  [ERROR_CODES.INVALID_PASSWORD_RESET_TOKEN]: { status: 400, message: 'Invalid password reset token' },
  [ERROR_CODES.PASSWORD_RESET_EXPIRED]: { status: 400, message: 'Password reset link has expired' },
  [ERROR_CODES.REFRESH_EXPIRED]: { status: 401, message: 'Invalid refresh token' },
  [ERROR_CODES.USER_NOT_FOUND]: { status: 401, message: 'Invalid or expired token' }
};

module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const mapped = ERROR_RESPONSES[err.message];
  const status = mapped?.status || err.status || err.statusCode || 500;
  const message = mapped?.message || (status === 500 ? 'Internal server error' : err.message);

  if (status >= 500) {
    console.error('Unhandled error:', err);
  }

  res.status(status).json({ error: message });
};

