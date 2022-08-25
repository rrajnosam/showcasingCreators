//REQUIRE PACKAGES
require("dotenv").config()
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const cookieSession = require("cookie-session")
const passport = require("passport")
const cron = require("node-cron")
const path = require('path')
const flash = require("connect-flash")
const passportSetup = require("./config/passport-setup.js")
const authCheck = require("./controllers/auth-check.js")
const Channel = require("./models/channel-model.js")
const Twitch = require("./models/twitch-model.js")
const Cotds = require("./models/channelOfTheDays-model.js")
const paginate = require("./controllers/paginate.js")



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

app.use("/auth", require("./routes/auth-routes.js"))

app.use("/tag-submit", require("./routes/tag-routes.js"))

// app.use("/vote", require("./routes/youtube/vote-routes.js"))

app.use("/youtube", require("./routes/youtube-display-routes.js"))
app.use("/twitch", require("./routes/twitch-routes.js"))

app.get("/", paginate, (req, res) => {
  res.render("home.ejs", { user: req.user, paginate: res.paginate })
})

app.get("/profile", paginate, (req, res) => {
  res.render("profile.ejs", { user: req.user, paginate: res.paginate })
})

app.get("/suggest-channel", paginate, (req, res) => {
  res.render("suggest-channel.ejs", { user: req.user, paginate: res.paginate })
})

app.get("/cookie-policy", paginate, (req, res) => {
  res.render("legal/cookie-policy.ejs", { user: req.user, paginate: res.paginate })
})

app.get("/privacy-policy", paginate, (req, res) => {
  res.render("legal/privacy-policy.ejs", { user: req.user, paginate: res.paginate })
})

app.get("/terms-of-service", paginate, (req, res) => {
  res.render("legal/terms-of-service.ejs", { user: req.user, paginate: res.paginate })
})


//SAVE VOTE COUNT TO DATABASE EVERY WEEK
let i = 0

// cron.schedule("0 0 * * 1", async () => {
//   // cron.schedule("*/15 * * * *", async () => {

//   console.log("updated weekly vote count", i)
//   i++

//   //----------------------------------YOUTUBE UPDATE WEEKLY VOTE COUNT -------------
//   try {

//     const no = await Channel.updateMany({}, [{ $set: { votesSinceLastWeek: { $subtract: ["$votes", "$votesLastWeek"] } } }])
//     const blah = await Channel.updateMany({}, [{ $set: { votesLastWeek: "$votes" } }])

//   } catch (err) {
//     console.log(err)
//   }
//   //------------------------TWITCH UPDATE WEEKLY VOTE COUNT ------------------
//   try {

//     const eh = await Twitch.updateMany({}, [{ $set: { votesSinceLastWeek: { $subtract: ["$votes", "$votesLastWeek"] } } }])
//     const bleh = await Twitch.updateMany({}, [{ $set: { votesLastWeek: "$votes" } }])

//   } catch (err) {
//     console.log(err)
//   }
// })


//GENERATE CHANNEL OF THE DAYS
let cotd = 0
let udcotd = 1
let rcotd = 2

let cotdTwitch = 0
let udcotdTwitch = 1
let rcotdTwitch = 2

cron.schedule(" 0 0 * * *", async () => {
  try {
    const totalDocs = await Channel.countDocuments()
    const twitchDocs = await Twitch.countDocuments()

    // console.log(cotd, rcotd, udcotd)
    // console.log(cotdTwitch, rcotdTwitch, udcotdTwitch)

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

    // console.log(cotd, rcotd, udcotd)

    //------------------------ twitch random numbers -------------------
    let cotdNewTwitch = Math.floor(Math.random() * (twitchDocs))
    while ((cotdNewTwitch == cotdTwitch) || (cotdNewTwitch == udcotdTwitch) || (cotdNewTwitch == rcotdTwitch)) {
      cotdNewTwitch = Math.floor(Math.random() * (twitchDocs))
    }

    let udcotdNewTwitch = Math.floor(Math.random() * (twitchDocs))
    while ((udcotdNewTwitch == udcotdTwitch) || (udcotdNewTwitch == cotdTwitch) || (udcotdNewTwitch == rcotdTwitch) || (udcotdNewTwitch == cotdNewTwitch)) {
      udcotdNewTwitch = Math.floor(Math.random() * (twitchDocs))
    }

    let rcotdNewTwitch = Math.floor(Math.random() * (twitchDocs))
    while ((rcotdNewTwitch == rcotdTwitch) || (rcotdNewTwitch == udcotdTwitch) || (rcotdNewTwitch == cotdTwitch) || (rcotdNewTwitch == cotdNewTwitch) || (rcotdNewTwitch == udcotdNewTwitch)) {
      rcotdNewTwitch = Math.floor(Math.random() * (twitchDocs))
    }

    cotdTwitch = cotdNewTwitch
    rcotdTwitch = rcotdNewTwitch
    udcotdTwitch = udcotdNewTwitch


    // console.log(cotdTwitch, rcotdTwitch, udcotdTwitch)

    let cotds = [cotd, rcotd, udcotd]
    let cotdsTwitch = [cotdTwitch, rcotdTwitch, udcotdTwitch]

    const zero = await Channel.find().limit(1).skip(cotds[0])
    const one = await Channel.find().limit(1).skip(cotds[1])
    const two = await Channel.find().limit(1).skip(cotds[2])

    const zeroTwitch = await Twitch.find().limit(1).skip(cotdsTwitch[0])
    const oneTwitch = await Twitch.find().limit(1).skip(cotdsTwitch[1])
    const twoTwitch = await Twitch.find().limit(1).skip(cotdsTwitch[2])

    cotds[0] = zero[0]
    cotds[1] = one[0]
    cotds[2] = two[0]

    cotdsTwitch[0] = zeroTwitch[0]
    cotdsTwitch[1] = oneTwitch[0]
    cotdsTwitch[2] = twoTwitch[0]

    // console.log(cotds)
    // console.log(cotdsTwitch)

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

    //------------------ twitch channel update -----------------

    const twitch1 = await Cotds.updateOne({ _id: "5fb712a83ab4894a6e6153e1" },
      {
        $set:
        {
          channel: cotdsTwitch[0]._id,
          indexNumber: cotdTwitch
        }
      }).catch((err) => console.log(err))

    const twitch2 = await Cotds.updateOne({ _id: "5fb712b23ab4894a6e6153e2" },
      {
        $set:
        {
          channel: cotdsTwitch[1]._id,
          indexNumber: rcotdTwitch
        }
      }).catch((err) => console.log(err))

    const twitch3 = await Cotds.updateOne({ _id: "5fb713393ab4894a6e6153e3" },
      {
        $set:
        {
          channel: cotdsTwitch[2]._id,
          indexNumber: udcotdTwitch
        }
      }).catch((err) => console.log(err))


    console.log("updated channel of the days")

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
