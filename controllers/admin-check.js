const adminCheck = (req, res, next) => {
    res.render("admin-login.ejs")



    // if (!req.user) {
    //     res.redirect("/auth/login");
    // } else if (req.user) {
    //     next();
    // }
};

module.exports = adminCheck;
