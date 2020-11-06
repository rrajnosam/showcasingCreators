const mongoose = require("mongoose");

const twitchSchema = new mongoose.Schema({
    // channelId: {
    //     type: String,
    //     // unique: true,
    //     // required: true
    // },
    name: {
        type: String,
        required: true,
        unique: true
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
        unique: true
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

    }


}, { timestamps: true })

twitchSchema.index({ name: 'text', description: 'text', tags: 'text' });


const Twitch = mongoose.model("twitch", twitchSchema);

module.exports = Twitch;
