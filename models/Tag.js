const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
    name: String,
    description: {type: String, default: "Set Description"},
    roomIds: [String]
}, {
    timestamps: true
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
