require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const server = express();
const log = require("./logstash.js");
const auth = require("./auth.js");

mongoose.set("useFindAndModify", false);

const Logger = function (req, res, next) {
  log("info", "request-incoming", {
    path: req.url,
    method: req.method,
    ip: req.ip,
    ua: req.headers["user-agent"] || null,
  });
  next();
};

server.use(Logger);

server.use(express.json());
server.use(morgan("dev"));

server.get("/", async (req, res) => {
  log("info", "request-outgoing", { svc: "users_api" });
  res.send("users_api working");
});

server.post("/register", async (req, res) => {
  try {
    const { admin, username, pass } = req.body;

    if (!(username && pass)) {
      return res.status(400).send("All input is required");
    }

    const old_user = await User.findOne({ username: username });

    if (old_user) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    encryptedPassword = await bcrypt.hash(pass, 10);

    const user = await User.create({
      username: username,
      password: encryptedPassword,
      admin: admin,
    });

    const token = jwt.sign(
      { user_id: user._id, username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "48h",
      }
    );

    user.token = token;

    return res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

server.post("/login", async (req, res) => {
  try {
    const { username, pass } = req.body;

    // Validate user input
    if (!(username && pass)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(pass, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      return res.status(200).json(user);
    }
    return res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

server.get("/auth_test", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

server.get("/users", auth, async (req, res) => {
  users = await User.find();
  console.log(users);
  res.send(JSON.stringify(users));
});

server.post("/addfriend", auth, async (req, res) => {
  const { username, friend } = req.body;

  const query = { username: username };

  r = await User.findOneAndUpdate(
    query,
    { $push: { friends: friend } },
    {
      new: true,
    }
  );
  res.send(JSON.stringify(r));
});

server.delete("/admin/delete", auth, async (req, res) => {
  const { to_delete, username } = req.body;
  try {
    user = await User.findOne({ username: username });
  } catch (error) {
    console.log(error);
  }

  if (!user || user == null || user.admin == false) {
    return res.send("Must be admin to delete user");
  }
  r = await User.findOneAndDelete({ username: to_delete });
  res.json({ Deleted: r });
});

server.post("/like", auth, async (req, res) => {
  const { username, post_id } = req.body;

  const query = { name: username };

  const like = await Post.findByIdAndUpdate(
    post_id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  console.log(like);

  var r = await User.findOneAndUpdate(
    query,
    { $push: { likes: { post_id } } },
    {
      new: true,
    }
  );
  res.send(JSON.stringify(r));
});

server.post("/comment", auth, async (req, res) => {
  const { username, post_id, description } = req.body;

  r = await Post.findByIdAndUpdate(
    post_id,
    { $push: { comments: { description: description, username: username } } },
    {
      new: true,
    }
  );
  res.send(JSON.stringify(r));
});

server.get("/health", async () => {
  console.log("health check");
  return "OK";
});

server.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "127.0.0.1";

const dbURI = process.env.MONGO_URI;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("connected to db");
    console.log("running on port: " + PORT);
    server.listen(PORT, () => {
      log("verbose", "listen", { host: HOST, port: PORT });
    });
  })
  .catch((err) => console.log(err));
