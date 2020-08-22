const authCheck = (req, res, next) => {
  if (!req.user) {
    res.redirect("/auth/login");
  } else if (req.user) {
    next()
  }
}

module.exports = authCheck;
