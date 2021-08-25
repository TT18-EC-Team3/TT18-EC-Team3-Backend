module.exports = {
    "port" : process.env.PORT,
    "db" : process.env.DB_CONNECT,
    "secret": process.env.JWT_KEY,
    "adminsecret" : process.env.ADMIN,
    "adminLife" : 1800,
    "tokenLife": 86400,
  }