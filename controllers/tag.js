const Room = require('../models/Room');
const Tag = require('../models/Tag');

/***
 * GET /api/tags
 * Returns all tags that exist
 */
exports.index = (req, res, next) => {
    Tag.find().lean().exec((err, tags) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(tags);
    });
};

/***
 * GET /api/tags/:tagId
 * Returns a list of all rooms that are tagged w/ this tag
 */
exports.getRooms = (req, res, next) => {
    let tag = req.params.tag;

    Room.find({
        tags: tagId
    }).lean().exec((err, rooms) => {
        res.setHeader('Content-Type', 'application/json');
        res.json(rooms);
    });
};

/***
 * POST /api/tags/makeTag/:tagName
 * Creates a tag with a given name
 */
exports.makeTag = (req, res, next) => {
    let tagName = req.params.tagName;

    const newTag = new Tag({
        name: tagName
    });

    //TODO: See if the tag already exists
    //Save the new tag to the database.
    newTag.save((err) => {
        if (err) {
            return next(err);
        }
        else {
            res.send("Tag success");
        }
    });
};

/***
 * POST /api/tags/:tagId/setDescription
 * Sets the description of a tag
 */
exports.setDescription = (req, res, next) => {
    let tagId = req.params.tagId;
    let description = req.body.description;

    Tag.findOneAndUpdate({
        _id: tagId
    }, {description: description}, {upsert:true}, function(err, doc){
        if (err) {
            return res.send(500, { error: err });
        }
        return res.send("Description set");
    });
};
