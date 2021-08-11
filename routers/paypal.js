const express = require('express');
const paypal = require('paypal-rest-sdk');

const router = express.Router()

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AeMADqH6cXZpN7y_P1_OogZ9jjgW1GXw7t-LIcrh4o--2VUdOs8gW8ypP_3gh-sDa7GidjOOhE9hcZ_9',
    'client_secret': 'EBadCO5cA_L4lE5u9ttQXk4Ka32Z9d55lRT49UGT-pmEqmww3AVFNvid_FD-tjLSxASDYAFvxIa9NoTz'
});

router.post('/api/pay', async(req,res)=>{
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/api/pay/success",
            "cancel_url": "http://localhost:3000/api/pay/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for( let i = 0; i < payment.links.length;++i)
                if (payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                }
        }
    });
});

router.get('/api/pay/success', async(req,res)=>{
    const payerID = req.query.PayerID;
    const paymentID = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerID,
        "transaction": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };

    paypal.payment.execute(paymentID, execute_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
           console.log("Payment Response");
           console.log(JSON.stringify(payment));
           res.send({message:"Success!"});
        }
    });
})

router.get('/api/pay/cancel', async(req,res) => res.send({message:"Cancelled!"}))

module.exports = router;
