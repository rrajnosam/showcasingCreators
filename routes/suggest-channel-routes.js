require("dotenv").config()
const router = require("express").Router()
const authCheck = require("../controllers/auth-check.js")
const paginate = require("../controllers/paginate.js")
const adminCheck = require("../controllers/admin-check.js")
const User = require("../models/user-model.js")
const Channel = require("../models/channel-model.js")
const Tag = require("../models/tag-model.js")
const Suggestion = require("../models/suggestion-model.js")
const bcrypt = require("bcryptjs")

router.get("/", authCheck, paginate, async (req, res) => {
    let categoryList = await Tag.find({}, { name: 1, _id: 0 })
        .catch((err) => console.log(err))
    categoryList = categoryList.map((each) => each.name)
    categoryList = categoryList.sort()
    // console.log(categoryList)
    res.render("suggest-channel.ejs", { user: req.user, paginate: res.paginate, categoryList: categoryList })
})

router.post("/", authCheck, paginate, async (req, res) => {
    const url = req.body.channelUrl.trim()
    const category = req.body.category
    const tags = req.body.channelTags.trim()

    // console.log(url, category)
    try {
        const foundChannel = await Channel.findOne({ link: url })
            .catch((err) => console.log(err))
        const foundSuggestion = await Suggestion.findOne({ suggestionUrl: url })
            .catch((err) => console.log(err))
        if (foundChannel || foundSuggestion) {
            // console.log("this channel already exists " + foundChannel);
            res.send("this channel is already in the site or has already been suggested")
        } else {

            let newSuggestion = await new Suggestion({
                suggestionUrl: url,
                suggestionCategory: category,
                suggestionTags: tags
            }).save()
                .catch((err) => console.log(err))
            // console.log(newSuggestion)

            res.render("partials/submit-success.ejs", { user: req.user, paginate: res.paginate })
        }
    } catch (err) {
        console.log(err)
    }
})


router.get("/admin", (req, res) => {
    // const password = "JLpRewlmEm7t!&suSp4p7AdR$WrABiwR3n2M@T3eQ7z7T650*SWARASwo4ruj+Wo"
    // const saltRounds = 10

    // bcrypt.genSalt(saltRounds, (err, salt) => {
    //     if (err) {
    //         throw err
    //     } else {
    //         bcrypt.hash(password, salt, (err, hash) => {
    //             if (err) {
    //                 throw err
    //             } else {
    //                 console.log(hash)
    //             }
    //         })
    //     }
    // })
    console.log("entered")

    // const adminPassword = "JLpRewlmEm7t!&suSp4p7AdR$WrABiwR3n2M@T3eQ7z7T650*SWARASwo4ruj+Wo"
    // const hash = "$2a$10$psuI0aziLqdeVN6iyyQyA.CspX8QlHq3DHQ87l093fiV1MByfkWLe"

    // bcrypt.compare(adminPassword, hash, (err, isMatch) => {
    //     if (err) {
    //         throw err
    //     } else if (!isMatch) {
    //         console.log("doesn't match")
    //     } else {
    //         console.log("password matches")
    //     }
    // })
    // // if ((req.user._id == process.env.ADMIN_ID) || (req.user._id == process.env.ADMIN_ID1)) {
    // res.render("admin/suggest-channel-admin.ejs")
    // } else {
    //     res.status(401).send("unauthorized")
    // }
})

router.post("/admin", authCheck, (req, res) => {
    // console.log(req.body.channelUrl)
    // console.log(req.body.channelName)
    // console.log(req.body.channelImg)
    // console.log(req.body.channelDescription)
    // console.log(req.body.tags)

    if ((req.user._id == process.env.ADMIN_ID) || (req.user._id == process.env.ADMIN_ID1)) {
        const tags = req.body.tags.trim()
        tagsArray = tags.split(", ")
        // console.log(tagsArray)

        Channel.findOne({ name: req.body.channelName }).then((foundChannel) => {
            if (foundChannel) {
                // console.log("this channel already exists " + foundChannel);
                done(null, foundChannel).catch((err) => console.log(err))
                res.send("this channel already exists")
            } else {
                new Channel({
                    name: req.body.channelName.trim(),
                    description: req.body.channelDescription.trim(),
                    image: req.body.channelImg.trim(),
                    link: req.body.channelUrl.trim(),
                    tags: tagsArray
                }).save()
                    .catch((err) => console.log(err))
                res.status(200).send("successfully saved to database")

            }
        })

    } else {
        res.status(401).send("unauthorized")
    }

})

router.get("/admin/show", authCheck, paginate, async (req, res) => {
    try {
        if ((req.user._id == process.env.ADMIN_ID) || (req.user._id == process.env.ADMIN_ID1)) {
            const suggestions = await Suggestion.find({})
                .catch((err) => console.log(err))
            res.render("admin/show-suggestions-admin.ejs", { user: req.user, paginate: res.paginate, suggestions: suggestions })
        } else {
            res.status(401).send("unauthorized")
        }
    } catch (err) {
        console.log(err)
    }
})

router.post("/admin/show/delete", authCheck, paginate, async (req, res) => {
    try {
        if ((req.user._id == process.env.ADMIN_ID) || (req.user._id == process.env.ADMIN_ID1)) {
            // console.log(req.body)
            try {
                const request = JSON.parse(Object.keys(req.body))
                const deleted = await Suggestion.deleteOne({ _id: request.id })
                    .catch((err) => console.log(err))
                // console.log(deleted)
                res.status(200).send()
            } catch (err) {
                console.log(err)
                res.status(500).send()
            }
        } else {
            res.status(401).send("unauthorized")
        }
    } catch (err) {
        console.log(err)
    }
})

router.post("/admin/show/deleteall", authCheck, paginate, async (req, res) => {
    try {
        if ((req.user._id == process.env.ADMIN_ID) || (req.user._id == process.env.ADMIN_ID1)) {
            try {
                const deletedAll = await Suggestion.deleteMany({})
                    .catch((err) => console.log(err))
                // console.log(deletedAll)
                res.status(200).send()
            } catch (err) {
                res.status(500).send()
            }

        } else {
            res.status(401).send("unauthorized")
        }
    } catch (err) {
        console.log(err)
    }
})

module.exports = router