const jwt=require("jsonwebtoken");
require("dotenv").config();

const jwtAuthMiddleware=(req,res,next)=>{
    const authorization=req.headers.authorization;
    if(!authorization)
    {
        return res.status(401).json({error: "token not found"});
    }
    const token=req.headers.authorization.split(" ")[1];
    if(!token)
    {
        return res.status(401).json({error: "Unauthorized"});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(e){
        res.status(401).json({error:"Invalid token"});
    }
}

const generateToken=(userdata)=>{
    return jwt.sign(userdata,process.env.JWT_SECRET,{expiresIn:300000});
}
module.exports={jwtAuthMiddleware,generateToken};