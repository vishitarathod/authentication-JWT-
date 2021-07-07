const JWT=require('jsonwebtoken');
const createError=require('http-errors');
const client = require('./init_redis')

module.exports={
    signAccessToken: (userId)=>{
        return new Promise((resolve,reject)=>{
            const payload={
                name:'xyz'
            }
            const secret=process.env.ACCESS_TOKEN_SECRET
            const option={
                expiresIn:'1y',
                issuer:'',
                audience:userId
            }
            JWT.sign(payload,secret,option,(err,token)=>{
                if(err){
                    console.log(err);
                    return reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },
    verifyAccessToken:(req,res,next)=>{
        if(!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader=req.headers['authorization']
        const bearerToken=authHeader.split(' ');
        const token=bearerToken[1];

        JWT.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,payload)=>{
            if(err){
                if(err.name==='JsonWebTokenError'){
                    return next(createError.Unauthorized());
                }else{
                    return next(createError.Unauthorized(err.message));
                }
               
            }
            req.payload=payload
            next()
        })
    },
    signRefreshToken: (userId)=>{
        return new Promise((resolve,reject)=>{
            const payload={ name:'xyz'}
            const secret=process.env.REFRESH_TOKEN_SECRET
            const option={
                expiresIn:'1y',
                issuer:'',
                audience:userId
            }
            JWT.sign(payload,secret,option,(err,token)=>{
                if(err){
                    console.log(err);
                    return reject(createError.InternalServerError())
                }
                client.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                    if (err) {
                      console.log(err.message)
                      reject(createError.InternalServerError())
                      return
                    }
                    resolve(token)
                  })
            })
        })
    },
    verifyRefeshToken:(refreshToken)=>{
        return new Promise((resolve,reject)=>{
            JWT.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,token)=>{
                if(err) return reject(createError.Unauthorized())
                const userId=payload.aud
                client.GET(userId, (err, result) => {
                    if (err) {
                      console.log(err.message)
                      reject(createError.InternalServerError())
                      return
                    }
                    if (refreshToken === result) return resolve(userId)
                    reject(createError.Unauthorized())
                  })
            })
        })
    }
}