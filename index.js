const express = require('express')
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin/auth')
const tutorRouter = require('./routers/tutorRouter')
const courseRouter = require('./routers/courseRouter')
const port = process.env.PORT
require('./database/data')


const app = express()

app.use(express.json())

app.use(userRouter)
app.use(adminRouter)
app.use(tutorRouter)
app.use(courseRouter)

app.get('/', function (req, res){
    res.send("hello")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})