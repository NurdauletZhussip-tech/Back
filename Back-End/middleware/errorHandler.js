const ERROR_RESPONSES = {
  EMAIL_EXISTS: { status: 409, message: 'Email already exists' },
  EMAIL_NOT_VERIFIED: { status: 403, message: 'Email is not verified' },
  EMAIL_VERIFICATION_EXPIRED: { status: 400, message: 'Email verification link has expired' },
  EXERCISE_NOT_FOUND: { status: 404, message: 'Exercise not found' },
  INVALID_EMAIL_VERIFICATION_TOKEN: { status: 400, message: 'Invalid email verification token' },
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid credentials' },
  INVALID_REFRESH: { status: 401, message: 'Invalid refresh token' },
  NOT_FOUND: { status: 404, message: 'Not found' },
  INVALID_PASSWORD_RESET_TOKEN: { status: 400, message: 'Invalid password reset token' },
  PASSWORD_RESET_EXPIRED: { status: 400, message: 'Password reset link has expired' },
  REFRESH_EXPIRED: { status: 401, message: 'Invalid refresh token' }
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

