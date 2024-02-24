const express=require("express");
const app=express();
const router=express.Router();
const Candidate=require("../models/candidate");
const User=require("../models/user");

const {jwtAuthMiddleware}=require("./../jwt");

const bodyParser=require('body-parser');
app.use(bodyParser.json());

const checkAdminRole=async(userID)=>{
    try{
        const user=await User.findById(userID);
        return (user.role=="admin");
    }
    catch(err){
        return false;
    }

}



router.post("/", jwtAuthMiddleware, async(req,res)=>{
    try{
        if(!await checkAdminRole(req.user.id))
        {
            return res.status(403).json({message: "user is not admin"})
        }
        const data=req.body;
        const newCandidate=new Candidate(data);
        const response=await newCandidate.save();
        console.log("data saved");
        
        
        res.status(200).send(response);
    }
    catch(err){
        console.log(err);
        res.status(500).send(err);

    }

 })




router.put("/:candidateID", jwtAuthMiddleware, async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id))
        {
            return res.status(403).json({message: "user is not admin"})
        }
        const candidateID=req.params.candidateID;
        const updatedCandidateData=req.body;
        const response=await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new:true,
            runValidators:true
        })
        if(!response)
        {
            return res.status(404).json({error: "candidate not found"});
        }
        console.log("data updated");
        res.status(200).json(response);
        
    }
    catch(err){
        res.status(500).json({error: "Internal Server Error"})
    }
})

router.delete("/:candidateID", jwtAuthMiddleware, async(req,res)=>{
    try{
        if(!checkAdminRole(req.user.id))
        {
            return res.status(403).json({message: "user is not admin"})
        }
        const candidateID=req.params.candidateID;
        
        const response=await Candidate.findByIdAndDelete(candidateID);
        if(!response)
        {
            return res.status(404).json({error: "candidate not found"});
        }
        console.log("candidate deleted");
        res.status(200).json(response);
        
    }
    catch(err){
        res.status(500).json({error: "Internal Server Error"})
    }
})

router.post("/vote/:candidateID", jwtAuthMiddleware,async (req,res)=>{

    const candidateID=req.params.candidateID;
    console.log(candidateID);
    const userID=req.user.id;
    console.log(userID);
    try{
        const candidatedata=await Candidate.findById(candidateID);
        if(!candidatedata)
        {
            return res.send(404).json({message:"candidate is not found"});
        }
        const userdata=await User.findById(userID);
        if(!userdata)
        {
            return res.send(404).json({message:"user not found"});
        }
        if(userdata.role==="admin"){
            return res.send(404).json({message:"admin can't vote"});
        }
        if(userdata.isvoted)
        {
            return res.status(404).json({message:"you have already given vote"}); 
        }
    
        candidatedata.votes.push({user:userID});
        candidatedata.votecount++;
        await candidatedata.save();

        userdata.isvoted=true;
        await userdata.save();
        res.status(200).json({message: "vote recorded successfully"});
    }
    catch(err){
        res.status(500).json({error: "Internal Server Error in voting"});
    }
})
router.get("/vote/count", async(req,res)=>{
    try{
        const candidate= await Candidate.find().sort({votecount:"desc"});
        const voterecord=candidate.map((data)=>{
            return {
                party:data.party,
                count:data.votecount
            }
        })
        return res.status(200).send(voterecord);
        
    }
    catch(err)
    {
        res.status(500).json({error: "Internal Server Error"});
    }
})

module.exports=router;