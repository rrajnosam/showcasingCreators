const router = require("express").Router()
const cron = require("node-cron")
const authCheck = require("../controllers/auth-check.js")
const paginate = require("../controllers/paginate.js")
const User = require("../models/user-model.js")
const Channel = require("../models/channel-model.js")

//------------------------------- GENERATE CHANNEL OF THE DAYS -------------------------------
global.cotd = 0
global.udcotd = 1
global.rcotd = 2

cron.schedule(" 0 0 * * *", async () => {
    // console.log("run this every  MINUTE")
    try {
        const totalDocs = await Channel.countDocuments()
        global.cotd = Math.floor(Math.random() * (totalDocs - 3))
        global.udcotd = Math.floor(Math.random() * (totalDocs - 3))
        global.rcotd = Math.floor(Math.random() * (totalDocs))

        while ((global.udcotd == global.cotd) || (global.udcotd == global.rcotd)) {
            global.udcotd = Math.floor(Math.random() * (totalDocs))
        }
        while ((global.rcotd == global.cotd) || (global.rcotd == global.udcotd)) {
            global.rcotd = Math.floor(Math.random() * (totalDocs))
        }

    } catch (err) {
        console.log(err)
    }
})

//------------------------------------ GET YOUTUBE HOMEPAGE -------------------------------------

router.get("/", paginate, async (req, res) => {
    // console.log(res)
    try {

        let results
        const totalDocs = await Channel.countDocuments()
            .catch((err) => console.log(err))
        let random = Math.floor(Math.random() * (totalDocs - 3))
        let cotds = [global.cotd, global.rcotd, global.udcotd]
        // console.log(cotds)

        while ((cotds.indexOf(random) != -1) || (cotds.indexOf(random + 1) != -1) || (cotds.indexOf(random + 2) != -1)) {
            random = Math.floor(Math.random() * (totalDocs - 3))
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

                const zero = await Channel.find().limit(1).skip(cotds[0])
                const one = await Channel.find().limit(1).skip(cotds[1])
                const two = await Channel.find().limit(1).skip(cotds[2])

                cotds[0] = zero[0]
                cotds[1] = one[0]
                cotds[2] = two[0]


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

        // console.log(votedChannelsArray)
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
