const router = require("express").Router()
const authCheck = require("../controllers/auth-check.js")
const User = require("../models/user-model.js");
const Channel = require("../models/channel-model.js")

router.get("/", authCheck, (req, res) => {
    res.send("you have reached get vote routes")
})

router.post("/", authCheck, (req, res) => {
    // console.log("post request received")
    const response = JSON.parse(Object.keys(req.body))
    let votes = "0"
    let disabled = { up: false, down: false }

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

})


module.exports = router