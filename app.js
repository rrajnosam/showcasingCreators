//REQUIRE PACKAGES
require("dotenv").config()
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const cookieSession = require("cookie-session")
const passport = require("passport")
const cron = require("node-cron")
const path = require('path');
const flash = require("connect-flash")
const authRoutes = require("./routes/auth-routes.js")
const profileRoutes = require("./routes/profile-routes.js")
const searchRoutes = require("./routes/search-routes.js")
const youtubeDisplayRoutes = require("./routes/youtube-display-routes.js")
const suggestChannelRoutes = require("./routes/suggest-channel-routes.js")
const tagRoutes = require("./routes/tag-routes.js")
const voteRoutes = require("./routes/vote-routes.js")
const passportSetup = require("./config/passport-setup.js")
const authCheck = require("./controllers/auth-check.js")
const Channel = require("./models/channel-model.js")



//INITIALIZE PACKAGES
const app = express();

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [
      process.env.COOKIE_KEY_1,
      process.env.COOKIE_KEY_2,
      process.env.COOKIE_KEY_3,
    ],
    name: "sessionid",
    cookie: {
      secure: true,
      httpOnly: true,
      //domain: "localhost",
      //path: "foo/bar",
      //expires: expiryDate,
    },
  })
)

//INITIALIZE PASSPORT
app.use(passport.initialize())
app.use(passport.session())

//CONNECT TO DATABASE
mongoose.set('useFindAndModify', false);
mongoose
  .connect(process.env.DATABASE_CLOUD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log("MongoDB Atlas Database connected"))
  .catch((err) => console.log(err))

//FLASH MESSAGAES

// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//   res.locals.messages = require('express-messages')(req, res);
//   next();
// });

// app.use(function (req, res, next) {
//   res.locals.success_messages = req.flash('success_messages');
//   res.locals.error_messages = req.flash('error_messages');
//   next();
// });

//SET UP routes

app.use("/auth", authRoutes)

app.use("/profile", profileRoutes)

app.use("/search", searchRoutes)

app.use("/suggest-channel", suggestChannelRoutes)
app.use("/tag-submit", tagRoutes)

app.use("/vote", voteRoutes)

app.use("/youtube", youtubeDisplayRoutes)

app.get("/", (req, res) => {
  res.redirect("/youtube")
})

//SAVE VOTE COUNT TO DATABASE EVERY WEEK
let i = 0

// cron.schedule("* * * * 0", async () => {
cron.schedule("* * * * 0", async () => {

  console.log("run this every 15 seconds", i)
  i++
  try {

    const no = await Channel.updateMany({}, [{ $set: { votesSinceLastWeek: { $subtract: ["$votes", "$votesLastWeek"] } } }])
    const blah = await Channel.updateMany({}, [{ $set: { votesLastWeek: "$votes" } }])

  } catch (err) {
    console.log(err)
  }
})



// START SERVER

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("server started on port " + port)
})