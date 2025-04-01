import express from 'express'
import User from '../models/user.model.js';
import {jwtAuthMiddleware,generateToken} from '../auth/jwt.js'
const router = express.Router();

//add a user route.
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;

    //check if there is already an admin user.

    const adminUser = await User.findOne({ role: 'admin' });

    if (data.role === 'admin' && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    //create a new user document using the monggose model.
    const newuser = new User(data);
    const response = await newuser.save();

    // res.status(200).json(response);

    // when the user is created and saved in db then in the response we are getting the user .

    // so we can use this response to create payload to generate token.

    //you can add any information of the user in this payload which will be used to generate the token.

    //payload is in js object format.
    // so here in the payload we are adding user id only.
    const payload = {
      id: response.id,
    
    }

    const token = generateToken(payload);

    console.log("token is ", token);

    res.status(200).json({ response: response, token: token });


  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


//login route.

router.post("/login", async(req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    // check if aadhar or password any is missing.

    if (!aadharCardNumber || !password) {
      return res.status(400).json({ error: "Aadhar Number and password are required" });
    }

    console.log(aadharCardNumber, password);

    //find the user by aadharCardNumber.

    const user = await User.findOne({ aadharCardNumber:aadharCardNumber });

    console.log(user);
   
    //if the user doesnot exists or password is incorrect.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid aadharCardNumber or Password " });
    }

    //generate token.

    const payload = {
      id: user.id,
    }

    const token = generateToken(payload)

    res.json({ token });
  } catch(error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})


//Profile route. Route to get profile using token.

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    //middleware se payload mil jayega from request.
    const userData = req.user_payload.userdata;
    console.log("User Data ",userData)

    const userId = userData.id;
   
   
    
    const user = await User.findById(userId);

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

//change user password .
router.put('/profile/password',jwtAuthMiddleware, async (req, res) => {
  try {
    //extract userId from token.
    const userId = req.user_payload.userdata.id;
    
    //extract current and new password from the req body
    const { currentPassword, newPassword } = req.body;
    

    //check if the current and newPassword are present in the req.body.
    if (!currentPassword || !newPassword) {
      res.status(400).json({error:"Both current or newPassword are required"})
    }

    // find the user by userId.

    const user = await User.findById(userId);

    // if user does not exist or password does not match return error.

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    //update the user password.
    
    user.password = newPassword;

    await user.save();

    console.log('password updated');
    res.status(200).json({message:"Password updated"});
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


  //exporting this router to get userroute in server.js file
export default router;