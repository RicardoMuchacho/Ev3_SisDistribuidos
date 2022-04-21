const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
  },
  comments: [
    {
      username: String,
      description: String,
    },
  ],
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
