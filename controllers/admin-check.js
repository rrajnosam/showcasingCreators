const adminCheck = (req, res, next) => {
    res.redirect("/auth/admin/login")



    // if (!req.user) {
    //     res.redirect("/auth/login");
    // } else if (req.user) {
    //     next();
    // }
};

module.exports = adminCheck;
