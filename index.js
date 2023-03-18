/* Boilerplate */
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

//MongoDB
let mongoose = require("mongoose");
let uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useFindAndModify", false);
const User = require("./models/user");
const Exercise = require("./models/exercise");

// middlewares
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Static

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

//User creation endpoint
app.post("/api/users", async function (req, res) {
  let username = req.body.username; //Get username from request
  //console.log(username + " " + typeof username);
  let newUser = new User({ username: username, log: [] }); //Create new user instance
  //Check if user exists
  await findUser(username).then((user) => {
    if (typeof user === "undefined" || user.length == 0) {
      newUser.save().then((user) => {
        let id = user._id.toString();
        res.json({
          username: user.username,
          _id: id,
        });
      });
    } else {
      //Get id of user
      let id = user[0]._id.toString();
      res.json({
        error: "Username already taken",
        username: username,
        _id: id,
      });
    }
  });
});

//Get all users endpoint
app.get("/api/users", async function (req, res) {
  let users = await User.find({}).then((users) => {
    return users;
  });
  res.json(users);
});

//Add exercise endpoint
app.post("/api/users/:_id/exercises", async function (req, res) {
  let id = req.params._id;
  const {
    description,
    duration,
    date = req.body.date ? req.body.date : new Date(),
  } = req.body;
  //Check if user exists
  await findUserById(id).then((user) => {
    if (typeof user === "undefined" || user.length == 0) {
      res.json({
        error: "User not found",
      });
    } else {
      //Create new exercise instance
      let newExercise = new Exercise({
        description: description,
        duration: duration,
        date: date,
        userId: id,
      });
      //Save exercise
      newExercise.save().then((exercise) => {
        user.log.push(exercise);
        user.save().then((user) => {
          res.json({
            username: user.username,
            description: exercise.description,
            duration: exercise.duration,
            date: new Date(exercise.date).toDateString(),
            _id: id,
          });
        });
      });
    }
  });
});

//Get exercise log endpoint
app.get("/api/users/:_id/logs", async function (req, res) {
  let id = req.params._id;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  //Check if user exists
  await findUserById(id).then((user) => {
    if (typeof user === "undefined" || user.length == 0) {
      res.json({
        error: "User not found",
      });
    } else {
      //Get user log
      let log = user.log;
      //Filter log by from date
      if (from) {
        let fromDate = new Date(from);
        log = log.filter((exercise) => {
          return new Date(exercise.date) >= fromDate;
        });
      }
      //Filter log by to date
      if (to) {
        let toDate = new Date(to);
        log = log.filter((exercise) => {
          return new Date(exercise.date) <= toDate;
        });
      }
      //Limit log
      if (limit) {
        log = log.slice(0, limit);
      }
      //Send response
      res.json({
        username: user.username,
        _id: id,
        count: log.length,
        log: log.map((exercise) => {
          return {
            description: exercise.description,
            duration: exercise.duration,
            date: new Date(exercise.date).toDateString(),
          };
        }),
      });
    }
  });
});

//Find user function
async function findUser(username) {
  let result = await User.find({ username: username }).then((user) => {
    return user;
  });
  return result;
}

//Find user by id function
async function findUserById(id) {
  let result = await User.findById({ _id: id }).then((user) => {
    return user;
  });
  return result;
}

//Listener
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
/* Boilerplate */
