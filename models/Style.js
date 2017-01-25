const mongoose = require('mongoose');

//Types are wall, ceiling, floor, frame
const styleSchema = new mongoose.Schema({
    roomId: String,
    fileName: String,
    type: String
}, {
    timestamps: true
});

const Style = mongoose.model('Style', styleSchema);

module.exports = Style;
