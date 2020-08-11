const router = require("express").Router()
const _ = require("lodash")
const authCheck = require("../controllers/auth-check.js")
const paginate = require("../controllers/paginate.js")
const User = require("../models/user-model.js")
const Channel = require("../models/channel-model.js")
const Tag = require("../models/tag-model.js")


router.post("/", paginate, async (req, res) => {
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

        res.render("search-results.ejs", {
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

router.get("/", paginate, async (req, res) => {
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


        res.render("search-results.ejs", {
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

router.get("/tags", paginate, async (req, res) => {
    // console.log(req.query.search)
    // console.log(req.query.sort)
    const capTag = _.capitalize(req.query.tag)
    try {
        let results
        // console.log(req.query.tag.toLowerCase().replace(/ /g, ''))
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


        const totalDocs = await Channel.countDocuments({ tags: req.query.tag.toLowerCase().replace(/ /g, '') })
            .catch((err) => console.log(err))
        const numberOfPages = Math.ceil(totalDocs / res.paginate.limit)
        res.paginate.numberOfPages = numberOfPages
        if (res.paginate.endIndex >= totalDocs) {
            res.paginate.nextPage = 0
        }
        if (res.paginate.startIndex <= 0) {
            res.paginate.previousPage = 0
        }


        res.render("search-results.ejs", {
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

module.exports = router