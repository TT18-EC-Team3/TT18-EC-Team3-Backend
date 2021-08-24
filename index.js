const express = require('express')
const cors = require('cors');
const userRouter = require('./routers/user')
const adminRouter = require('./routers/admin/auth')
const tutorRouter = require('./routers/admin/tutor')
const courseRouter = require('./routers/admin/course')
const port = process.env.PORT
const tutor_public = require('./routers/tutor')
const course_public = require('./routers/course')
const paypal = require('./routers/paypal')
const payment = require('./routers/payment')
const pay_admin = require('./routers/admin/payment')
const voucher = require('./routers/voucher')
const voucher_admin = require('./routers/admin/voucher')
require('./database/data')


const app = express()

app.use(cors({
    origin: '*'
}));

app.use(express.json())

app.use(userRouter)
app.use(adminRouter)
app.use(tutorRouter)
app.use(courseRouter)

app.use(tutor_public)
app.use(course_public)

app.use(paypal)
app.use(payment)
app.use(pay_admin)

app.use(voucher)
app.use(voucher_admin)

app.get('/', function (req, res){
    res.send("hello")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})