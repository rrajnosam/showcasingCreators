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


router.get("/admin", adminCheck, (req, res) => {
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
    // console.log("entered")

    res.render("admin/suggest-channel-admin.ejs", { user: req.user, paginate: res.paginate, suggestions: suggestions })

})

router.post("/admin", (req, res) => {
    // console.log(req.body.channelUrl)
    // console.log(req.body.channelName)
    // console.log(req.body.channelImg)
    // console.log(req.body.channelDescription)
    // console.log(req.body.tags)
    // console.log(req.body.admin)


    bcrypt.compare(req.body.admin, process.env.HASH, (err, isMatch) => {
        if (err) {
            console.log(err)
            res.status(401).send("401 unauthorized")
        } else if (!isMatch) {
            // console.log("doesn't match")
            res.status(401).send("401 unauthorized")
        } else {
            // console.log("password matches")
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
        }
    })




})

router.get("/admin/show", adminCheck, paginate, async (req, res) => {
    try {

        const suggestions = await Suggestion.find({})
            .catch((err) => console.log(err))
        res.render("admin/show-suggestions-admin.ejs", { user: req.user, paginate: res.paginate, suggestions: suggestions })

    } catch (err) {
        console.log(err)
    }
})

router.post("/admin/show/delete", paginate, async (req, res) => {
    const request = JSON.parse(Object.keys(req.body))

    bcrypt.compare(request.admin, process.env.HASH, async (err, isMatch) => {
        if (err) {
            console.log(err)
            res.status(401).send("401 unauthorized")
        } else if (!isMatch) {
            // console.log("doesn't match")
            res.status(401).send("401 unauthorized")
        } else {
            // console.log("password matches")
            try {
                const deleted = await Suggestion.deleteOne({ _id: request.id })
                    .catch((err) => console.log(err))
                // console.log(deleted)
                res.status(200).send()
            } catch (err) {
                console.log(err)
                res.status(500).send()
            }
        }
    })
})

router.post("/admin/show/deleteall", paginate, async (req, res) => {
    try {
        const request = JSON.parse(Object.keys(req.body))

        bcrypt.compare(request.admin, process.env.HASH, async (err, isMatch) => {
            if (err) {
                console.log(err)
                res.status(401).send("401 unauthorized")
            } else if (!isMatch) {
                // console.log("doesn't match")
                res.status(401).send("401 unauthorized")
            } else {
                // console.log("password matches")

                try {
                    const deletedAll = await Suggestion.deleteMany({})
                        .catch((err) => console.log(err))
                    // console.log(deletedAll)
                    res.status(200).send()
                } catch (err) {
                    res.status(500).send()
                }

            }
        })

    } catch (err) {
        console.log(err)
    }
})

module.exports = router