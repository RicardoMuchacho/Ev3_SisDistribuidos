const dotenv = require("dotenv").config();
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const fs = require("fs");
const redis = require("redis");
const mongoose = require("mongoose");
const User = require("./models/user");
const Post = require("./models/post");
const auth = require("./auth.js");
const log = require("./logstash.js");
const server = express();

const DEFAULT_EXPIRATION = 3600;

mongoose.set("useFindAndModify", false);

/*
const client = redis.createClient({
  host: "ev3_redis",
  port: 6379,
});

(async () => {
  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  //await client.set("why", "value");
})();
*/
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

server.get("/post/", async (req, res) => {
  log("info", "request-outgoing", { svc: "posts_api" });
  res.send("posts_api working");
});

server.get("/post/posts", async (req, res) => {
  /*
  const posts = await client.get("posts");
  if (posts != null) {
    return res.json(JSON.parse(posts));
  } else {
    const data = await Post.find();
    console.log(data);
    client.setEx("posts", DEFAULT_EXPIRATION, JSON.stringify(data));
    res.json(data);
  }
*/
  const data = await Post.find();
  console.log(data);
  res.json(data);

  /*
  client.get("posts", async (error, posts) => {
    if (error) console.log(error);
    if (posts != null) {
      console.log(posts);
      return res.json(JSON.parse(posts));
    } else {
      const { data } = await Post.find();
      console.log(data);
      client.setEx("posts", DEFAULT_EXPIRATION, JSON.stringify(data));
      console.log(data);
      res.json(data);
    }
  });
  */
});

server.post("/post/create", auth, async (req, res) => {
  const { username, description } = req.body;
  const post = await Post.create({
    username: username,
    description: description,
  });
  res.send(JSON.stringify(post));
});

server.post("/post/like", async (req, res) => {
  const { post_id } = req.body;

  const like = await Post.findByIdAndUpdate(
    post_id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  console.log(like);
  res.send(JSON.stringify(like));
});

server.post("/post/comment", auth, async (req, res) => {
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

server.get("/error", async (req, res) => {
  res.send("oh no");
});

server.get("/health", async () => {
  console.log("health check");
  return "OK";
});

async function getSetCache(key, cb) {
  return new Promise((resolve, reject) => {
    redis_client.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.stringiy(data));
      const fresh_data = await cb();
      redisClient.setEx(key, DEFAULT_EXPIRATION, JSON.parse(fresh_data));
      resolve(fresh_data);
    });
  });
}

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

const PORT = process.env.PORT || "3001";
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
