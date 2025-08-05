

var corsOptions = {
  origin: process.env.NODE_ENV == 'local' ? process.env.localUrl : process.env.remoteUrl,
  credentials: true
};

function setCorsHeaders(req, res, next) {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV == 'local' ? process.env.localUrl : process.env.remoteUrl)
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}


module.exports = {
  setCorsHeaders,
  corsOptions
}