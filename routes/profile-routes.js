const router = require("express").Router()
const authCheck = require("../controllers/auth-check.js")
const adminCheck = require("../controllers/admin-check.js")
const paginate = require("../controllers/paginate.js")
const User = require("../models/user-model.js")
const Channel = require("../models/channel-model.js")


router.get("/", authCheck, paginate, async (req, res) => {

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
