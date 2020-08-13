const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20")
const LocalStrategy = require('passport-local').Strategy
const User = require("../models/user-model.js")

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      callbackURL: "/auth/google/redirect",
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then((foundUser) => {
        if (foundUser) {
          //console.log("this user already exists " + foundUser);
          done(null, foundUser);
        } else {
          // console.log(profile)
          new User({
            username: profile.displayName,
            googleId: profile.id,
            thumbnail: profile._json.picture
          })
            .save()
            .then((newlyCreatedUser) => {
              //console.log("you have created  " + newlyCreatedUser);
              done(null, newlyCreatedUser);
            }).catch((err) => console.log(err))
        }
      })
    }
  )
)


passport.use(new LocalStrategy(
  function (password, done) {

    const hash = "$2a$10$psuI0aziLqdeVN6iyyQyA.CspX8QlHq3DHQ87l093fiV1MByfkWLe"

    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) {
        throw err
      } else if (!isMatch) {
        console.log("doesn't match")
        return done(null, false, { message: 'Incorrect password.' });
      } else {
        console.log("password matches")
        return done(null, user);
      }
    })

  }
));
