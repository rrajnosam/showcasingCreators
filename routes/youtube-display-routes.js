require("dotenv").config()
const router = require("express").Router()
const _ = require("lodash")
const authCheck = require("../controllers/auth-check.js")
const adminCheck = require("../controllers/admin-check.js")
const paginate = require("../controllers/paginate.js")
const User = require("../models/user-model.js")
const Channel = require("../models/channel-model.js")
const Cotds = require("../models/channelOfTheDays-model.js")
const Tag = require("../models/tag-model.js")
const Suggestion = require("../models/suggestion-model.js")
const bcrypt = require("bcryptjs")


//------------------------------------ GET YOUTUBE HOMEPAGE -------------------------------------

router.get("/", paginate, async (req, res) => {
    try {
        let results
        const totalDocs = await Channel.countDocuments()
            .catch((err) => console.log(err))
        let random = Math.floor(Math.random() * (totalDocs - 3))
        const preCotds = await Cotds.find({}).catch((err) => console.log(err))

        const listCotdsIDs = preCotds.map((each) => each.channel)

        // console.log(listCotdsIDs)

        const cotds = await Channel.find({ _id: { $in: listCotdsIDs } }).catch((err) => console.log(err))

        const listCotdsIndex = preCotds.map((each) => each.indexNumber)

        while ((listCotdsIndex.indexOf(random) != -1) || (listCotdsIndex.indexOf(random + 1) != -1) || (listCotdsIndex.indexOf(random + 2) != -1)) {
            random = Math.floor(Math.random() * (totalDocs - 3))
            // console.log(random)
        }

        // console.log(random)
        if (req.query.sort === "recent") {
            results = await Channel.find({}, null, { sort: { createdAt: -1 } }).limit(3).skip(random)
                .catch((err) => console.log(err))
        } else if (req.query.sort === "upvotes") {
            results = await Channel.find({}, null, { sort: { votes: -1 } }).limit(3).skip(random)
                .catch((err) => console.log(err))
        } else {
            try {

                results = await Channel.find().limit(3).skip(random)

            } catch (err) {
                console.log(err)
            }
        }
        // console.log(results)
        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }

        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }

        // console.log(cotds)
        res.render("youtube/yt-home.ejs", {
            user: req.user,
            votedChannelsArray: votedChannelsArray,
            results: results,
            paginate: res.paginate,
            sortOption: req.query.sort,
            cotds: cotds
        })
    } catch (err) {
        console.log(err)
    }

})

//--------------------------------------- GET YOUTUBE TOP RATED PAGE ------------------------------------

router.get("/top-rated", paginate, async (req, res) => {
    // console.log(req)
    try {
        let results

        if (req.query.sort === "recent") {
            results = await Channel.find({}, null, { sort: { votes: -1 } })
                .catch((err) => console.log(err))
            results.sort((a, b) => b.createdAt - a.createdAt)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else if (req.query.sort === "upvotes") {
            results = await Channel.find({}, null, { sort: { votes: -1 } })
                .catch((err) => console.log(err))
            results.sort((a, b) => a.votes - b.votes)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else {
            results = await Channel.find({}, null, { sort: { votes: -1 } })
                .catch((err) => console.log(err))
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)
        }


        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }
        // console.log(votedChannelsArray)
        const totalDocs = await Channel.countDocuments()
            .catch((err) => console.log(err))
        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }

        res.render("youtube/display-cards.ejs", {
            user: req.user,
            votedChannelsArray: votedChannelsArray,
            results: results,
            paginate: res.paginate,
            sortOption: req.query.sort

        })
    } catch (err) {
        console.log(err)
    }
})

//--------------------------------------GET YOUTUBE RECENT SUGGESTIONS PAGE --------------------------

router.get("/recent-suggestions", paginate, async (req, res) => {
    try {
        if (req.query.sort === "recent") {
            results = await Channel.find({}, null, { sort: { createdAt: -1 } })
                .catch((err) => console.log(err))
            results.sort((a, b) => a.createdAt - b.createdAt)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else if (req.query.sort === "upvotes") {
            results = await Channel.find({}, null, { sort: { createdAt: -1 } })
                .catch((err) => console.log(err))
            results.sort((a, b) => b.votes - a.votes)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else {
            results = await Channel.find({}, null, { sort: { createdAt: -1 } })
                .catch((err) => console.log(err))
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)
        }


        // console.log(results)
        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }

        // console.log(votedChannelsArray)

        const totalDocs = await Channel.countDocuments()
            .catch((err) => console.log(err))
        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }

        res.render("youtube/display-cards.ejs", {
            user: req.user,
            votedChannelsArray: votedChannelsArray,
            results: results,
            paginate: res.paginate,
            sortOption: req.query.sort

        })
    } catch (err) {
        console.log(err)
    }

})

// --------------------------------- GET YOUTUBE TRENDING PAGE -----------------------------------

router.get("/trending", paginate, async (req, res) => {
    try {
        if (req.query.sort === "recent") {
            results = await Channel.find({}, null, { sort: { votesSinceLastWeek: -1 } }).limit(13)
                .catch((err) => console.log(err))
            results.sort((a, b) => a.createdAt - b.createdAt)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else if (req.query.sort === "upvotes") {
            results = await Channel.find({}, null, { sort: { votesSinceLastWeek: -1 } }).limit(13)
                .catch((err) => console.log(err))
            results.sort((a, b) => b.votes - a.votes)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else {
            results = await Channel.find({}, null, { sort: { votesSinceLastWeek: -1 } }).limit(13)
                .catch((err) => console.log(err))
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)
        }


        // console.log(results)
        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }

        // console.log(votedChannelsArray)

        const totalDocs = 13
        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }

        res.render("youtube/display-cards.ejs", {
            user: req.user,
            votedChannelsArray: votedChannelsArray,
            results: results,
            paginate: res.paginate,
            sortOption: req.query.sort

        })
    } catch (err) {
        console.log(err)
    }

})

//---------------------------------GET CATEGORIES PAGE -------------------------------------------------

router.get("/categories", paginate, async (req, res) => {
    res.render("youtube/categories.ejs", {
        user: req.user,
        paginate: res.paginate

    })
})


//-------------------------------------------------------SEARCH ----------------------------------------------------

router.post("/search", paginate, async (req, res) => {
    // console.log(String(req.body.query), "lkj")
    let results = []
    let totalDocs = 0

    try {
        if (req.body.query != "") {
            results = await Channel.find({ $text: { $search: req.body.query } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                .catch((err) => console.log(err))
        }
        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }
        if (req.body.query != "") {
            totalDocs = await Channel.countDocuments({ $text: { $search: req.body.query } })
                .catch((err) => console.log(err))
        }

        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }

        res.render("youtube/search-results.ejs", {
            user: req.user,
            votedChannelsArray: votedChannelsArray,
            results: results,
            paginate: res.paginate,
            searchQuery: req.body.query,
            tag: req.query.tag,
            sortOption: req.query.sort
        })
    } catch (err) {
        console.log(err)
    }

})

router.get("/search", paginate, async (req, res) => {
    // console.log(req.query.search)
    // console.log(req.query.sort)
    let results = []
    let totalDocs = 0

    try {

        if (req.query.sort === "recent") {
            if (typeof req.query.search != "undefined") {
                results = await Channel.find({ $text: { $search: req.query.search } }, null, { sort: { createdAt: -1 } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                    .catch((err) => console.log(err))
            }
        } else if (req.query.sort === "upvotes") {
            if (typeof req.query.search != "undefined") {
                results = await Channel.find({ $text: { $search: req.query.search } }, null, { sort: { votes: -1 } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                    .catch((err) => console.log(err))
            }
        } else {
            if (typeof req.query.search != "undefined") {
                results = await Channel.find({ $text: { $search: req.query.search } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                    .catch((err) => console.log(err))
            }
        }

        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }

        if (typeof req.query.search != "undefined") {
            totalDocs = await Channel.countDocuments({ $text: { $search: req.query.search } })
                .catch((err) => console.log(err))
        }

        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }


        res.render("youtube/search-results.ejs", {
            user: req.user,
            votedChannelsArray: votedChannelsArray,
            results: results,
            paginate: res.paginate,
            searchQuery: req.query.search,
            tag: req.query.tag,
            sortOption: req.query.sort
        })
    } catch (err) {
        console.log(err)
    }
})

router.get("/search/tags", paginate, async (req, res) => {
    // console.log(req.query.search)
    // console.log(req.query.sort)
    let capTagArray = req.query.tag.split("/")
    let capTag
    if (capTagArray.length > 1) {
        capTagArray[0] = _.capitalize(capTagArray[0].trim())
        capTagArray[1] = _.capitalize(capTagArray[1].trim())

        capTag = capTagArray.join("/")

    } else {
        capTag = _.capitalize(req.query.tag)
    }
    // console.log(capTag)

    try {
        let results
        // console.log(capTag.replace(/ /g, ''))
        if (req.query.sort === "recent") {
            results = await Channel.find({ tags: capTag.replace(/ /g, '') }, null, { sort: { createdAt: -1 } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                .catch((err) => console.log(err))
        } else if (req.query.sort === "upvotes") {
            results = await Channel.find({ tags: capTag.replace(/ /g, '') }, null, { sort: { votes: -1 } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                .catch((err) => console.log(err))

        } else {
            results = await Channel.find({ tags: capTag.replace(/ /g, '') }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                .catch((err) => console.log(err))
            // console.log(results)

        }

        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }


        const totalDocs = await Channel.countDocuments({ tags: capTag.replace(/ /g, '') })
            .catch((err) => console.log(err))
        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }


        res.render("youtube/search-results.ejs", {
            user: req.user,
            votedChannelsArray: votedChannelsArray,
            results: results,
            paginate: res.paginate,
            searchQuery: req.query.search,
            tag: req.query.tag,
            sortOption: req.query.sort
        })
    } catch (err) {
        console.log(err)
    }
})


//----------------------------------------------------------- SUGGEST CHANNEL ---------------------------------------


router.get("/suggest-channel", authCheck, paginate, async (req, res) => {
    let categoryList = await Tag.find({}, { name: 1, _id: 0 })
        .catch((err) => console.log(err))
    categoryList = categoryList.map((each) => each.name)
    categoryList = categoryList.sort()
    // console.log(categoryList)
    res.render("youtube/suggest-channel.ejs", { user: req.user, paginate: res.paginate, categoryList: categoryList })
})

router.post("/suggest-channel", authCheck, paginate, async (req, res) => {
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


router.get("/suggest-channel/admin", adminCheck, paginate, (req, res) => {

    res.render("admin/suggest-channel-admin.ejs", { user: req.user, paginate: res.paginate })

})

router.post("/suggest-channel/admin", (req, res) => {
    // console.log(req.body.channelUrl)
    // console.log(req.body.channelName)
    // console.log(req.body.channelImg)
    // console.log(req.body.channelDescription)
    // console.log(req.body.tags)
    // console.log(req.body.admin)


    bcrypt.compare(req.body.admin, process.env.HASH2, (err, isMatch) => {
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

router.get("/suggest-channel/admin/show", adminCheck, paginate, async (req, res) => {
    try {

        const suggestions = await Suggestion.find({})
            .catch((err) => console.log(err))
        res.render("admin/show-suggestions-admin.ejs", { user: req.user, paginate: res.paginate, suggestions: suggestions })

    } catch (err) {
        console.log(err)
    }
})

router.post("/suggest-channel/admin/show/delete", paginate, async (req, res) => {
    const request = JSON.parse(Object.keys(req.body))

    bcrypt.compare(request.admin, process.env.HASH2, async (err, isMatch) => {
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

router.post("/suggest-channel/admin/show/deleteall", paginate, async (req, res) => {
    try {
        const request = JSON.parse(Object.keys(req.body))

        bcrypt.compare(request.admin, process.env.HASH2, async (err, isMatch) => {
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


//-------------------------------------------VOTE ROUTES-------------------------------------------


router.get("/vote", authCheck, (req, res) => {
    res.send("you have reached get vote routes")
})

router.post("/vote", authCheck, (req, res) => {
    // console.log("post request received")
    const response = JSON.parse(Object.keys(req.body))
    let votes = "0"
    let disabled = { up: false, down: false }

    if (req.user.id == "5f498004d8128d0004ebf15a" || req.user.id == "5f497d12d8128d0004ebf12d" || req.user.id == "5f4994c5c2d39b00049073eb" || req.user.id == "5f48326ad8128d0004ebf098" || req.user.id == "5f483265d8128d0004ebf097") {
        if (response.direction === "up") {
            Channel.findOneAndUpdate({ _id: response.id }, { $inc: { votes: 1 } }, { new: true })
                .then((foundChannel) => {
                    // console.log(foundChannel)
                    votes = String(foundChannel.votes)
                    disabled = { up: false, down: false }
                    res.json({
                        votes: votes,
                        disabled
                    })
                }).catch((err) => { console.error(err) })

        } else if (response.direction === "down") {
            Channel.findOneAndUpdate({ _id: response.id }, { $inc: { votes: -1 } }, { new: true })
                .then((foundChannel) => {
                    // console.log(foundChannel)
                    votes = String(foundChannel.votes)
                    disabled = { up: false, down: false }
                    res.json({
                        votes: votes,
                        disabled
                    })
                }).catch((err) => { console.error(err) })
        }
    } else {


        User.findOne({ _id: req.user._id, "votedChannels.channel": response.id })
            .then((foundUser) => {
                if (foundUser) {
                    // console.log(foundUser)
                    const votedChannelsArray = foundUser.votedChannels.map((index) => String(index.channel))
                    const vidIndex = votedChannelsArray.indexOf(response.id)
                    const video = foundUser.votedChannels[vidIndex].channel
                    const pastDirection = foundUser.votedChannels[vidIndex].direction

                    // console.log("cancel the vote")
                    if ((response.direction === "up" || response.direction === "down") && pastDirection === "up") {
                        Channel.findOneAndUpdate({ _id: response.id }, { $inc: { votes: -1 } }, { new: true })
                            .then((returned) => {
                                User.updateOne({ _id: foundUser._id }, { $pull: { votedChannels: { channel: video } } })
                                    .then((updated) => {
                                        votes = String(returned.votes)
                                        disabled = { up: false, down: false }
                                        res.json({
                                            votes: votes,
                                            disabled
                                        })
                                    }).catch((err) => {
                                        console.log(err)
                                    })

                            }).catch((err) => {
                                console.log(err)
                            })
                    } else if ((response.direction === "down" || response.direction === "up") && pastDirection === "down") {
                        Channel.findOneAndUpdate({ _id: response.id }, { $inc: { votes: 1 } }, { new: true })
                            .then((returned) => {
                                User.findOneAndUpdate({ _id: foundUser._id }, { $pull: { votedChannels: { channel: video } } })
                                    .then((updated) => {
                                        votes = String(returned.votes)
                                        disabled = { up: false, down: false }
                                        res.json({
                                            votes: votes,
                                            disabled
                                        })
                                    }).catch((err) => {
                                        console.log(err)
                                    })

                            }).catch((err) => {
                                console.log(err)
                            })
                    }

                } else {
                    // console.log("this dude hasn't voted yet")
                    User.updateOne({ _id: req.user._id }, { $addToSet: { votedChannels: { channel: response.id, direction: response.direction } } })
                        .then((update) => {
                            if (response.direction === "up") {
                                Channel.findOneAndUpdate({ _id: response.id }, { $inc: { votes: 1 } }, { new: true })
                                    .then((foundChannel) => {
                                        // console.log(foundChannel)
                                        votes = String(foundChannel.votes)
                                        disabled = { up: true, down: false }
                                        res.json({
                                            votes: votes,
                                            disabled
                                        })
                                    }).catch((err) => { console.error(err) })

                            } else if (response.direction === "down") {
                                Channel.findOneAndUpdate({ _id: response.id }, { $inc: { votes: -1 } }, { new: true })
                                    .then((foundChannel) => {
                                        // console.log(foundChannel)
                                        votes = String(foundChannel.votes)
                                        disabled = { up: false, down: true }
                                        res.json({
                                            votes: votes,
                                            disabled
                                        })
                                    }).catch((err) => { console.error(err) })
                            }

                        }).catch((err) => {
                            console.log(err)
                        })
                }



            })
            .catch((err) => { console.error(err) })

        // }

    }
})

//------------------------------------------------ PROFILE PAGE ----------------------------------------------


router.get("/profile", authCheck, paginate, async (req, res) => {

    try {

        let votedChannelsArray = []
        let results = []

        // res.paginate.nextPage = 0
        // res.paginate.previousPage = 0
        if (req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))

            if (req.query.sort === "recent") {
                results = await Channel.find({ _id: { $in: votedChannelsArray } }, null, { sort: { createdAt: -1 } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                    .catch((err) => console.log(err))
            } else if (req.query.sort === "upvotes") {
                results = await Channel.find({ _id: { $in: votedChannelsArray } }, null, { sort: { votes: -1 } }).limit(res.paginate.limit).skip(res.paginate.startIndex)
                    .catch((err) => console.log(err))
            } else {
                const preResults = await Channel.find({ _id: { $in: votedChannelsArray } })
                    .catch((err) => console.log(err))
                // .limit(res.paginate.limit)
                // .skip(res.paginate.startIndex)

                // console.log(req.user.votedChannels.length)
                // console.log(preResults)
                if (preResults.length != 0) {
                    for (let i = 0; i < req.user.votedChannels.length; i++) {
                        if (String(req.user.votedChannels[i].channel) == String(preResults[i]._id)) {
                            results[i] = preResults[i]
                        } else {
                            for (let j = 0; j < preResults.length; j++) {
                                if (String(preResults[j]._id) == String(req.user.votedChannels[i].channel)) {
                                    results[i] = preResults[j]
                                    break
                                }
                            }
                        }
                    }
                    results.reverse()
                    results = results.slice(res.paginate.startIndex, res.paginate.endIndex)
                }

            }

            const totalDocs = await Channel.countDocuments({ _id: { $in: votedChannelsArray } })
                .catch((err) => console.log(err))
            const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
            res.paginate.numberOfPages = numberOfPages
            if (res.paginate.endIndex >= totalDocs) {
                res.paginate.nextPage = 0
            }
            if (res.paginate.startIndex <= 0) {
                res.paginate.previousPage = 0
            }


            res.render("youtube/profile.ejs", {
                user: req.user,
                votedChannelsArray: votedChannelsArray,
                results: results,
                paginate: res.paginate,
                sortOption: req.query.sort
            })
        } else {
            res.paginate.nextPage = 0
            res.paginate.previousPage = 0
            res.render("youtube/profile.ejs", {
                user: req.user,
                votedChannelsArray: votedChannelsArray,
                results: results,
                paginate: res.paginate,
                sortOption: req.query.sort
            })
        }
    } catch (err) {
        console.log(err)
    }

})


module.exports = router
