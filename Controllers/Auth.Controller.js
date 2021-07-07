const createError=require('http-errors');
const User=require('../models/User.model');

const {authSchema}=require('../helpers/validation_schema');
const {signAccessToken,signRefreshToken,verifyRefeshToken}=require('../helpers/jwt_helper');
const { client } = require('../helpers/init_redis');

module.exports={
    register:async(req,res,next)=>{
  
        try{
           
            // if(!email||!password) throw createError.BadRequest();
    
            const value =await authSchema.validateAsync(req.body)
    
            const doesExist=await User.findOne({email:value.email})
    
    
            if(doesExist) throw createError.Conflict(`${value.email} is already exist...`)
    
            const user=new User(value);
            const saveUser=await user.save();
            const accessToken=await signAccessToken(saveUser.id);
            const refreshToken=await signRefreshToken(saveUser.id)
            res.send({accessToken,refreshToken});       
        }catch(err){
            if(err.isJoi===true) err.status=422;
            next(err);
        }
    },
    login:async(req,res,next)=>{
        // res.send('login routes..');
        try {
       
            const value =await authSchema.validateAsync(req.body)
    
            const user=await User.findOne({email:value.email})
            if(!user) throw createError.NotFound("user not registred...");
            
            const isMatch=await user.isValidPassword(value.password)
            if(!isMatch) throw createError.Unauthorized("username/password not valid..")
    
            const accessToken=await signAccessToken(user.id);
            const refreshToken=await signRefreshToken(user.id)
            res.send({accessToken,refreshToken}); 
            // res.send(value);
        } catch (error) {
            if(error.isJoi===true) 
                return next(createError.BadRequest("Invalid username/password"))
            next(error)
        }
    },
    refresh:async(req,res,next)=>{
        try {
            const {refreshToken}=req.body;
            if(!refreshToken) throw createError.BadRequest()
            const userId=await verifyRefeshToken(refreshToken)
            
            const accessToken=await signAccessToken(userId);
            const refToken=await signRefreshToken(userId); 
            
            res.send({accessToken:accessToken,refreshToken:refToken})
        } catch (error) {
            next(error)
            
        }
    },logout: async (req, res, next) => {
        try {
          const { refreshToken } = req.body
          if (!refreshToken) throw createError.BadRequest()
          const userId = await verifyRefeshToken(refreshToken)
          client.DEL(userId, (err, val) => {
            if (err) {
              console.log(err.message)
              throw createError.InternalServerError()
            }
            console.log(val)
            res.sendStatus(204)
          })
        } catch (error) {
          next(error)
        }
      }
}