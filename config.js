module.exports = {
    "port" : process.env.PORT,
    "db" : process.env.DB_CONNECT,
    "secret": process.env.JWT_KEY,
    "refreshTokenSecret": process.env.REFRESH,
    "tokenLife": 30,
    "refreshLife" : 86400
  }