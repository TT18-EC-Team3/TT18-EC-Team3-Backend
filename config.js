module.exports = {
    "port" : process.env.PORT,
    "db" : process.env.DB_CONNECT,
    "secret": process.env.JWT_KEY,
    "refreshTokenSecret": process.env.REFRESH,
    "adminsecret" : process.env.ADMIN,
    "adminLife" : 1800,
    "tokenLife": 30,
    "refreshLife" : 86400
  }