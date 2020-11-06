const mongoose = require("mongoose");

const twitchSuggestionSchema = new mongoose.Schema({

    suggestionUrl: {
        type: String,
        required: true,
        unique: true

    },
    suggestionCategory: {
        type: String,
        required: true
    },
    suggestionTags: {
        type: String,
        required: true
    }
})



const TwitchSuggestion = mongoose.model("twitchSuggestion", twitchSuggestionSchema);

module.exports = TwitchSuggestion;
