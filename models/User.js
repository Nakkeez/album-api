const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema ({
  username: {
    type: String,
    required: [true, 'Username must be provided'],
    minlength: [2, 'Username must be atleast 2 characters'],
    maxlength: [250, 'Username must not be more than 250 characters']
  },
  email: {
    type: String,
    required: [true, 'Email must be provided'],
    minlength: [5, 'Email must be atleast 5 characters'],
    maxlength: [250, 'Email must not be more than 250 characters'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user'],
      message: 'Role {VALUE} not available'
    },
    default: 'user'
  },
  passwordHash: {
    type: String,
    required: [true, 'Password must be provided']
  },
  albums: [{ type: Schema.Types.ObjectId, ref: 'Album' }]
});

userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    const hashRounds = 12;
    this.passwordHash = await bcrypt.hash(this.passwordHash, hashRounds);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);