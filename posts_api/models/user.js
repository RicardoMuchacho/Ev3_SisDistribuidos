const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
    required: true,
  },
  friends: {
    type: [String],
  },
  likes: {
    type: [String],
  },
  token: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
