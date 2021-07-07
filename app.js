const express=require('express');
const morgan=require('morgan');
const createError=require('http-errors');
require('dotenv').config();
require('./helpers/init_mongodb')
const AuthRoute=require('./Routes/Auth.Route');
const {verifyAccessToken}=require('./helpers/jwt_helper')
const PORT=process.env.PORT||3000;
require('./helpers/init_redis')
const app=express();

app.use(morgan('dev'));
//get data in json formate
app.use(express.json());
//get data in form
app.use(express.urlencoded({extended:true}))


app.get('/',verifyAccessToken,async(req,res,next)=>{
    res.send('hello express.....')
});

app.use('/auth',AuthRoute);

app.use(async(req,res,next)=>{
    next(createError.NotFound())
})
app.use((err,req,res,next)=>{
    res.status(err.status||500);
    res.send({
        error:{
            status:err.status||500,
            message:err.message
        },
    })
})

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`);
});