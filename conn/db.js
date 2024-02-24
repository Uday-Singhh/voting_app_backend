const mongoose=require("mongoose");
require('dotenv').config();
const url=process.env.MONGODB_URL;

mongoose.connect(url).then(()=>{console.log("connected to mongo database")}).catch((e)=>{console.log("error in connected with local database")})
