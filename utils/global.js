const isApiRoute = (req) => req.originalUrl.startsWith('/api');

module.exports = { isApiRoute };
