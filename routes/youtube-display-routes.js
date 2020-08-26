const router = require("express").Router()
const cron = require("node-cron")
const authCheck = require("../controllers/auth-check.js")
const paginate = require("../controllers/paginate.js")
const User = require("../models/user-model.js")
const Channel = require("../models/channel-model.js")
const Cotds = require("../models/channelOfTheDays-model.js")



//------------------------------------ GET YOUTUBE HOMEPAGE -------------------------------------

router.get("/", paginate, async (req, res) => {
    try {
        let results
        const totalDocs = await Channel.countDocuments()
            .catch((err) => console.log(err))
        let random = Math.floor(Math.random() * (totalDocs - 3))
        const preCotds = await Cotds.find({}).catch((err) => console.log(err))

        const listCotdsIDs = preCotds.map((each) => each.channel)

        console.log(listCotdsIDs)

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
        res.render("yt-home.ejs", {
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

        res.render("display-cards.ejs", {
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

        res.render("display-cards.ejs", {
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
            results = await Channel.find({}, null, { sort: { votesSinceLastWeek: -1 } }).limit(11)
                .catch((err) => console.log(err))
            results.sort((a, b) => a.createdAt - b.createdAt)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else if (req.query.sort === "upvotes") {
            results = await Channel.find({}, null, { sort: { votesSinceLastWeek: -1 } }).limit(11)
                .catch((err) => console.log(err))
            results.sort((a, b) => b.votes - a.votes)
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)

        } else {
            results = await Channel.find({}, null, { sort: { votesSinceLastWeek: -1 } }).limit(11)
                .catch((err) => console.log(err))
            results = results.slice(res.paginate.startIndex, res.paginate.endIndex)
        }


        // console.log(results)
        let votedChannelsArray = []
        if (req.user && req.user.votedChannels.length != 0) {
            votedChannelsArray = req.user.votedChannels.map((index) => String(index.channel))
        }

        // console.log(votedChannelsArray)

        const totalDocs = 11
        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }

        res.render("display-cards.ejs", {
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

module.exports = router
