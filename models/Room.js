const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: String,
    userId: String,
    postIds: [String],
    tags: [String]
}, {
    timestamps: true
});

/**
 * Helper method adding a tag
 */
roomSchema.methods.addTag = function(tagId) {
    const room = this;
    room.tags.push(tagId);
    room.save();
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
