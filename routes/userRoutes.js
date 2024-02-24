const express=require("express");
const app=express();
const router=express.Router();
const User=require("../models/user");

const {jwtAuthMiddleware, generateToken}=require("./../jwt");

const bodyParser=require('body-parser');
app.use(bodyParser.json());





router.post("/signup",async(req,res)=>{
    try{
       
        const data=req.body;
        const newUser=new User(data);
        const response=await newUser.save();
        console.log("data saved");
        
        const payload={
            id:response.id
        }
        console.log(JSON.stringify(payload));
        const token=generateToken(payload);
        console.log(`token is ${token}`);
        res.status(200).send({response:response, token:token});
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);

    }

 })

router.post("/login",async(req,res)=>{
    try{
        const {aadharCardNumber, password}=req.body;
        const user=await User.findOne({aadharCardNumber:aadharCardNumber});
        if(!user || !(user.comparePassword(password))){
            return res.status(401).json({error:"Invalid User or Password"});
        }
        const payload={
            id:user.id
        }
        const token=generateToken(payload);
        res.json({token});
    }
    catch(err){
        res.status(500).json({error: "Internal Server Error"});
    }

})

router.get("/profile",jwtAuthMiddleware,async(req,res)=>{
    try{
        const userdata=req.user;
        const userid=userdata.id;
        const user=await User.findById(userid);
        res.status(200).json({user});
    }
    catch(err){
        res.status(500).json({error: "Internal server Error"});
    }
})

router.put("/profile/password", jwtAuthMiddleware, async(req,res)=>{
    try{
        const userId=req.user.id;
        const {currentPassword, newPassword}=req.body;
    
        const user=await User.findById(userId);
    
        if(!(await user.comparePassword(currentPassword)))
        {
            return res.status(401).json({error: "Invalid current password"});
        }
    
        user.password=newPassword;
        await user.save();
        console.log("password updated");
        res.status(200).json({message: "password updated"});
    }
    catch(err){
        res.status(500).json({error: "Internal Server Error"})
    }
})

module.exports=router;