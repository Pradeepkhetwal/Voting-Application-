import express from 'express'
import Candidate from '../models/candidate.user.js';
import User from '../models/user.model.js';
import {jwtAuthMiddleware,generateToken} from '../auth/jwt.js'
const router = express.Router();

//candidate is the one who is standing in the election.


//function to check if user is admin.

const checkAdminRole = async (userId) => {
  const user = await User.findById(userId);
  try {
    if (user.role === 'admin') {
      
      return true;
    }
  }
  catch (error) {
   
    return false;
  }
}

//only a admin user is allowed to add a candidate.
//add a candidate route.
router.post('/signup',jwtAuthMiddleware, async (req, res) => {
  try {

    if (!(await checkAdminRole(req.user_payload.userdata.id))) {
      return res.status(403).json({ error: "user does not have admin role " });
    }
    
    //assuming the request body contains the candidate data.
    const data = req.body;

    //create a new candidate document.
    const newCandidate = new Candidate(data);

    // save the candidate to the database.

    const response = await newCandidate.save();


    console.log('data saved');

    return res.status(200).json({response:response})


  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


//update the candidate data route.(only admin can update the candidate data)
//parameterized route
router.put('/:candidateId', jwtAuthMiddleware, async (req,res) => {
  try {

    if (!(await checkAdminRole(req.user_payload.userdata.id))) {
      
      return res.status(403).json({ error: "user is not an admin" });
    }

    //extracting the candidateId from the route.
    const candidateId = req.params.candidateId;

    //extracting the updated data from the request .
    const updatedData = req.body;

    const response = await Candidate.findByIdAndUpdate(candidateId, updatedData, {
      new: true,
      runValidators:true
    })

    if (!response) {
      return res.status(400).json({ error: "Candidate does not found" });
    }

    return res.status(200).json({ response: response });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error " });
  }
})



//delete any candidate (only admin can delete the candidate).

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try {
   //check user(who wants to delete the candidate) is admin or not.
   if (!(await checkAdminRole(req.user_payload.userdata.id))){
      return res.status(403).json({
        message: "user is not an admin"})
    }

     // extract candidate id from route params.

    const candidateId = req.params.candidateId;

    
    //find and delete the candidate.
    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("candidate deleted");
    return res.status(200).json({ response: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
})


//lets write the route for voting(to give vote)
// admin can't vote.
// a voter can only vote once.

router.get('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
  
 const candidateId = req.params.candidateId;
 const  userId = req.user_payload.userdata.id;

  try {
    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (user.role == 'admin') {
      return res.status(403).json({ error: "admin can't vote" });
    }

    if (user.isVoted) {
      return res.status(400).json({ error: "You have already voted" });
    }


    //update the candidate document to record the vote.
    console.log(userId);
    candidate.votes.push({ user: userId });
    candidate.votesCount++;

    await candidate.save();

    //update the user document.
    user.isVoted = true;
    await user.save();

    return res.status(200).json({ message: "Vote recorded successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

//count the votes of all candidate.

router.get('/votingcount', async(req, res) => {
  try {
   
    //Find all the candidate and sort them by their votecount in desc order.
    // const candidate is an array of candidate documents returned from the below query.
    const candidate = await Candidate.find().sort({ votesCount: 'desc' });


    /*.map(): This is an array method that creates a new array by transforming each element. In this case, for each data (which represents a candidate), it returns a new object with only the party and voteCount properties.
    party: data.party: Extracts the party of the candidate.
    count: data.voteCount: Extracts the voteCount of the candidate and renames it to count in the new object.*/

    const voteRecord = candidate.map((data) => {
      return {
        party: data.party,
        count: data.votesCount
      }
    });
    
    return res.status(200).json(voteRecord);
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get list of all candidates with only name and party fields
router.get('/', async (req, res) => {
  try {
    // Find all candidates and select only the name and party fields, excluding _id
    const candidates = await Candidate.find({}, 'name party -_id');
    return res.status(200).json(candidates);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error " });
  }
})

export default router;