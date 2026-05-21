const { ipKeyGenerator, rateLimit } = require('express-rate-limit');

function userKey(req) {
  return req.userId || req.body?.email || req.body?.childId || ipKeyGenerator(req.ip);
}

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

exports.authUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 25,
  keyGenerator: userKey,
  message: { error: 'Too many auth requests for this user, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

exports.exerciseSubmissionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: parseInt(process.env.EXERCISE_SUBMIT_RATE_LIMIT_MAX, 10) || 30,
  keyGenerator: userKey,
  message: { error: 'Too many exercise submissions, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});
