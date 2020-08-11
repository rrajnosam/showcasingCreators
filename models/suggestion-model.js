const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({

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



const Suggestion = mongoose.model("suggestion", suggestionSchema);

module.exports = Suggestion;
