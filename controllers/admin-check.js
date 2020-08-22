const bcrypt = require("bcryptjs")

const adminCheck = (req, res, next) => {
    // console.log(req.query)

    bcrypt.compare(req.query.admin, process.env.HASH, (err, isMatch) => {
        if (err) {
            console.log(err)
            res.status(401).send("401 unauthorized")
        } else if (!isMatch) {
            // console.log("doesn't match")
            res.status(401).send("401 unauthorized")
        } else {
            // console.log("password matches")
            next()
        }
    })

}

module.exports = adminCheck;
