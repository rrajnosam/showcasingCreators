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
const Cotds = require("./models/channelOfTheDays-model.js")




//INITIALIZE PACKAGES
const app = express();

//FORCE SSL
env = process.env.NODE_ENV || 'development';

let directSsl = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};


if (env === 'production') {
  app.use(directSsl);
}

//SET CONFIG
app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))

//COOKIES
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
      secureProxy: true,
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
cron.schedule("*/15 * * * *", async () => {

  console.log("run this every 15 seconds", i)
  i++
  try {

    const no = await Channel.updateMany({}, [{ $set: { votesSinceLastWeek: { $subtract: ["$votes", "$votesLastWeek"] } } }])
    const blah = await Channel.updateMany({}, [{ $set: { votesLastWeek: "$votes" } }])

  } catch (err) {
    console.log(err)
  }
})


//GENERATE CHANNEL OF THE DAYS
let cotd = 0
let udcotd = 1
let rcotd = 2

cron.schedule(" */15 * * * *", async () => {
  console.log("run this every  MINUTE")
  try {
    const totalDocs = await Channel.countDocuments()

    // console.log(cotd, rcotd, udcotd)

    let cotdNew = Math.floor(Math.random() * (totalDocs))
    while ((cotdNew == cotd) || (cotdNew == udcotd) || (cotdNew == rcotd)) {
      cotdNew = Math.floor(Math.random() * (totalDocs))
    }

    let udcotdNew = Math.floor(Math.random() * (totalDocs))
    while ((udcotdNew == udcotd) || (udcotdNew == cotd) || (udcotdNew == rcotd) || (udcotdNew == cotdNew)) {
      udcotdNew = Math.floor(Math.random() * (totalDocs))
    }

    let rcotdNew = Math.floor(Math.random() * (totalDocs))
    while ((rcotdNew == rcotd) || (rcotdNew == udcotd) || (rcotdNew == cotd) || (rcotdNew == cotdNew) || (rcotdNew == udcotdNew)) {
      rcotdNew = Math.floor(Math.random() * (totalDocs))
    }

    cotd = cotdNew
    rcotd = rcotdNew
    udcotd = udcotdNew


    let cotds = [cotd, rcotd, udcotd]

    const zero = await Channel.find().limit(1).skip(cotds[0])
    const one = await Channel.find().limit(1).skip(cotds[1])
    const two = await Channel.find().limit(1).skip(cotds[2])

    cotds[0] = zero[0]
    cotds[1] = one[0]
    cotds[2] = two[0]

    // console.log(cotds[0].name)
    // console.log(cotds[1].name)
    // console.log(cotds[2].name)

    const life = await Cotds.updateOne({ _id: "5f403cef0273a0162f627f84" },
      {
        $set:
        {
          channel: cotds[0]._id,
          indexNumber: cotd
        }
      }).catch((err) => console.log(err))

    const life1 = await Cotds.updateOne({ _id: "5f403d180273a0162f627f85" },
      {
        $set:
        {
          channel: cotds[1]._id,
          indexNumber: rcotd
        }
      }).catch((err) => console.log(err))

    const life2 = await Cotds.updateOne({ _id: "5f403d460273a0162f627f87" },
      {
        $set:
        {
          channel: cotds[2]._id,
          indexNumber: udcotd
        }
      }).catch((err) => console.log(err))

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
