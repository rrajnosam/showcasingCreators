const mongoose = require("mongoose");

const cotdsSchema = new mongoose.Schema({
    // channelId: {
    //     type: String,
    //     // unique: true,
    //     // required: true
    // },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
    },
    indexNumber: Number


}, { timestamps: true })



const Cotds = mongoose.model("channelOfTheDays", cotdsSchema);

module.exports = Cotds;
