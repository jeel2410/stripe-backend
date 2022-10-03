const express= require('express')
const stripe= require("stripe")(process.env.NODE_APP_KEY)
const{v4:uuidv4}=require('uuid');
require('dotenv').config()

const router=express.Router();

router.get('/',(req,res)=>{
    console.log('get method ');
    res.json({
        message:"get method testing and its works!!"
    })
})
router.post('/pay',(req,res)=>{
    console.log(req.body.token);
    const {product,token} = req.body;
    const idempotencyKey=uuidv4();

    return stripe.customers.create({
        email:token.email,
        source:token.id
    }).then(customer=>{
        stripe.charges.create({
            amount:product.price*100,
            currency:'usd',
            customer:customer.id,
            receipt_email:token.email, 
            description:`purchase of ${product.name}`,
            shipping:{
                name:token.card.name,
                address:{
                    country:token.card.address_country

                }
            }  
        },{idempotencyKey})  

    }).then(result=>{
        res.status(200).json(result)
    }).catch(err=>{
        console.log(err);
    })
})
module.exports=router;