import mongoose from 'mongoose'

const userSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: number,
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
  }
});


const User = mongoose.Model('User', userSchema)

export default User;