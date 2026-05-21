const etag = require('etag');

function setRefreshTokenCookie(res, refreshToken) {
  if (!refreshToken) return;

  const days = parseInt(process.env.REFRESH_TOKEN_DAYS, 10) || 30;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: days * 24 * 60 * 60 * 1000
  });
}

function clearRefreshTokenCookie(res) {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

function sendCachedJson(req, res, payload, maxAgeSeconds = 60) {
  const body = JSON.stringify(payload);
  const generatedEtag = etag(body);

  res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}`);
  res.setHeader('ETag', generatedEtag);

  if (req.headers['if-none-match'] === generatedEtag) {
    return res.status(304).end();
  }

  return res.json(payload);
}

module.exports = {
  clearRefreshTokenCookie,
  sendCachedJson,
  setRefreshTokenCookie
};
