const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  phoneNumber: String,
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  tokens: Array,

  address: {
      country: String,
      city: String,
      street: String,
      house: String,
      flat: String
  },

  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Order'
  }]

}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
