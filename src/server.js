const express=require("express");
const app=express();
require("dotenv").config();
// const {jwtAuthMiddleware}=require("./../jwt");

const port=process.env.PORT || 3000;
require("../conn/db");
const bodyParser=require('body-parser');
app.use(bodyParser.json()); //req.body

const userRoutes=require("../routes/userRoutes");
const candidateRoutes=require("../routes/candidateRoutes");
app.use("/user",userRoutes);
app.use("/candidate", candidateRoutes);


app.listen(port,()=>{console.log(`listening to port ${port}`)});