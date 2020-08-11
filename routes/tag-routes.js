const router = require("express").Router()
const authCheck = require("../controllers/auth-check.js")
const paginate = require("../controllers/paginate.js")
const Channel = require("../models/channel-model.js")
const Tag = require("../models/tag-model.js")

router.get("/", authCheck, paginate, async (req, res) => {
    try {
        // if ((req.user._id == process.env.ADMIN_ID) || (req.user._id == process.env.ADMIN_ID1)) {
        res.render("tag-submit.ejs", { user: req.user, paginate: res.paginate })

        // } else {
        //     res.status(401).send("unauthorized")
        // }
    } catch (err) {
        console.log(err)
    }
})

router.post("/", authCheck, (req, res) => {
    // console.log("tag post")
    try {
        // if ((req.user._id == process.env.ADMIN_ID) || (req.user._id == process.env.ADMIN_ID1)) {
        new Tag({
            name: req.body.newTag
        }).save()
            .catch((err) => console.log(err))
        res.redirect("/tag-submit")
        // } else {
        //     res.status(401).send("unauthorized")
        // }
    } catch (err) {
        console.log(err)
    }

})

module.exports = router
