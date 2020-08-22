const router = require("express").Router();
const passport = require("passport");
const paginate = require("../controllers/paginate.js")
const bcrypt = require("bcryptjs")


//auth login

router.get("/login", paginate, (req, res) => {
  res.render("login.ejs", { user: req.user, paginate: res.paginate });
})

//auth logout

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})

//auth with GoogleStrategy

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile"],
  })
)

//callback route for google oauth2

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  //console.log(req.user);
  res.redirect("/profile");
})

//admin login

// router.get("/admin/login", (req, res) => {
//   res.render("admin/admin-login.ejs");

// })

// router.post("/admin/login", (req, res, next) => {
//   console.log(req.body.password)

//   passport.authenticate('local', {
//     successRedirect: '/suggest-channel/admin',
//     failureRedirect: '/auth/admin/login',
//     failureFlash: true
//   })

// })

module.exports = router;
