import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  aadharCardNumber: {
    type: Number,
    required: true,
    unqiue: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['voter', 'admin'],
    default: 'voter'
  },
  isVoted: {
    type: Boolean,
    default: false
  }
});

//pre is a middleware functin that is provided by the mongoose that runs just before the save function , so that we can use this middleware to hash our password before the actual save operation is performed.

userSchema.pre('save', async function(next) {
  //jis bhi record k liye save perform hone jaa raha hoga to uss record ko we are storing in user constant.
  const user = this;
  // Hash the password only if it has been modified or it is new.
  // so we have a isModifed function which takes a field as a parameter to check whether that field has been modified or not so here we have passed password field. If it has not modified or password is not new simply call next() means no need for hashing so try catch block run ni hoga seedhe aage proceed ho jayenge .
  if (!user.isModified('password')) return next();
  try {

    //first generate salt. Here we have a genSalt function provided by bcrypt here we pass a number generally representing the number of rounds . Usually more rounds generate more complex salt but hashfunction then might take more time to generate hashed password so 10 is always a ideal number to generate salt.

    const salt = await bcrypt.genSalt(10)

    //hash password can be generated using hashedPassword function which here is usually taking password and salt as the parameter and then generate the hashed password.
    const hashedPassword = await bcrypt.hash(user.password, salt);

    //Override the plain password with the hashed password.
    user.password = hashedPassword;

    //at last simply call next() . to indicate ab aage ka kaam karlo.
    next();
  } catch (error) {
    return next(error)
  }
})

// here we define custom method called as comparePassword in the user schema to check for password authentication.

userSchema.methods.comparePassword = async function(candidatePassword){
  try{
      // Use bcrypt to compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      return isMatch;
  }catch(err){
      throw err;
  }
}


const User = mongoose.model('User', userSchema)

export default User;