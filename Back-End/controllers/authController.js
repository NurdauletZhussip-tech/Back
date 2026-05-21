const AuthService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');
const {
  clearRefreshTokenCookie,
  setRefreshTokenCookie
} = require('../utils/controllerHelpers');

exports.registerParent = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;
  const result = await AuthService.registerParent(email, password, name);

  setRefreshTokenCookie(res, result.refreshToken);
  res.status(201).json({
    user: result.user,
    token: result.token,
    emailPreviewUrl: result.emailPreviewUrl,
    verificationUrl: result.verificationUrl
  });
});

exports.loginParent = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.loginParent(email, password);

  setRefreshTokenCookie(res, result.refreshToken);
  res.json({ user: result.user, token: result.token });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'Invalid refresh token' });

  const result = await AuthService.refreshAccessToken(refreshToken);
  res.json(result);
});

exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

  await AuthService.revokeRefreshToken(refreshToken);
  clearRefreshTokenCookie(res);
  res.json({ message: 'Logged out' });
});

exports.listChildren = asyncHandler(async (req, res) => {
  const children = await AuthService.getChildrenForParent(req.userId);
  res.json(children || []);
});

exports.createChild = asyncHandler(async (req, res) => {
  const { name, pin } = req.body;
  const child = await AuthService.createChild({ parentId: req.userId, name, pin });

  res.status(201).json(child);
});

exports.loginChild = asyncHandler(async (req, res) => {
  const { childId, pin } = req.body;
  const result = await AuthService.loginChild(childId, pin);

  setRefreshTokenCookie(res, result.refreshToken);
  res.json({ user: result.user, token: result.token });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Verification token required' });

  const user = await AuthService.verifyEmail(token);
  res.json({ message: 'Email verified', user });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.resendVerification(email);

  if (result.alreadyVerified) {
    return res.json({ message: 'Email is already verified' });
  }

  res.json({
    message: 'Verification email sent',
    emailPreviewUrl: result.emailPreviewUrl,
    verificationUrl: result.verificationUrl
  });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);

  res.json({
    message: 'If the email exists, password reset instructions have been sent',
    emailPreviewUrl: result.emailPreviewUrl,
    resetUrl: result.resetUrl
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await AuthService.resetPassword(token, password);

  res.json({ message: 'Password reset complete', user });
});
