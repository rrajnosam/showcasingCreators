const mongoose = require("mongoose");

const cotdsSchema = new mongoose.Schema({
    // channelId: {
    //     type: String,
    //     // unique: true,
    //     // required: true
    // },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
    },
    votes: {
        type: Number,
        default: 0
    },
    votesLastWeek: {
        type: Number,
        default: 0
    },
    votesSinceLastWeek: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],

    },
    indexNumber: Number


}, { timestamps: true })



const Cotds = mongoose.model("channelOfTheDays", cotdsSchema);

module.exports = Cotds;
