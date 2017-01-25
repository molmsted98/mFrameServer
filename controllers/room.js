const User = require('../models/User');
const Room = require('../models/Room');
const Post = require('../models/Post');

/***
 * GET /api/rooms
 * ???
 */
exports.index = (req, res, next) => {

};

/***
 * GET /api/rooms/:roomId
 * Returns data about the room, including tag, user, privacy
 */
exports.getInfo = (req, res, next) => {
    let roomId = req.params.roomId;

    Room.findOne({
        _id: roomId
    }).lean().exec((err, foundRoom) => {
        let postCount = foundRoom.postIds.length;
        let userId = foundRoom.userId;
        let tags = foundRoom.tags;
        //Return the information
        res.send({postCount: postCount, userId: userId, tags:tags});
    });
};

/***
 * GET /api/rooms/:roomId/posts
 * Returns locations of every post in the room
 */
exports.getPostInfo = (req, res, next) => {
    let roomId = req.params.roomId;

    //Verify that this room exists
    Room.findOne({
        _id: roomId
    }).lean().exec((err, foundRoom) => {
        //Get all of the posts from the room
        Post.find({
            id: roomId
        }).lean().exec((err, posts) => {
            //Extract all of the data about the posts
            coords = [];
            fileTypes = [];
            for (var i = 0; i < posts.length; i++) {
                var object = posts[i];
                coords.push(
                    object.coordinates
                );
                fileTypes.push(
                    object.fileType
                );
            }
            //Return coords and fileTypes as JSON
            res.send({coords: coords, fileTypes: fileTypes});
        });
    });
};

/***
 * GET /api/rooms/:roomId/posts/makePost
 * Returns the image associate with this post in this room
 */
exports.makePost = (req, res, next) => {
    let roomId = req.params.roomId;

    //Transfer the image to the proper folder

    //Update the database
    var numPo;
    var fileExtension = 'image';

    //When calling req.file.mimetype
    //.gif = image/gif
    //.png = image/png
    //.jpg = image/jpeg
    //.jpeg = image/jpeg

    //Prevents the user from uploading nothing.
    //TODO: Show an error message here.
    if (req.file === undefined) {
        req.flash('failure', {
            msg: 'Please select a file before uploading.'
        });
        return res.redirect('/upload');
    }

    //Set the filetypes so they are displayed properly.
    if (req.file.mimetype == 'image/gif') {
        fileExtension = 'gif';
    } else if (req.file.mimetype == 'some movie type') {
        //Eventually have support for videos?
    } else if (req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpeg') {
        //Come up with something better, to include obscure image types.
        fileExtension = 'image';
    } else {
        //Not an image, shouldn't be able to get here.
    }

    if (req.body.type == "Post") {
        //An image has been selected to be deleted.
        if (req.body.selected >= 0) {
            //Get all of the users' posts.
            Post.find({
                id: req.user.id
            }).lean().exec((err, posts) => {
                //Get information about the selected post.
                var pId = posts[parseInt(req.body.selected)]._id;
                var pFileName = posts[parseInt(req.body.selected)].fileName;
                //Remove Post from database.
                Post.find({
                    id: req.user.id,
                    _id: pId
                }).remove().exec();
                //Remove Post from the server directory.
                fs.exists('./public/uploads/' + pFileName, function(exists) {
                    if (exists) {
                        console.log('File exists. Deleting now ...');
                        fs.unlink('./public/uploads/' + pFileName);
                    } else {
                        console.log('File not found, so not deleting.');
                    }
                });
            });
        }

        //Setup the post with proper coordinates.
        Post.find({
            id: req.user.id
        }).lean().exec((err, posts) => {
            numPo = posts.length
            var post;
            if (parseInt(req.body.selected) < 0) {
                post = new Post({
                    id: req.user.id,
                    fileName: req.file.filename,
                    coordinates: positions[numPo],
                    fileType: fileExtension
                });
                //This post is replacing another one, use those coords.
            } else {
                post = new Post({
                    id: req.user.id,
                    fileName: req.file.filename,
                    coordinates: posts[parseInt(req.body.selected)].coordinates,
                    fileType: fileExtension
                });
            }
            //Save the post to database.
            post.save((err) => {
                req.flash('failure', {
                    msg: 'File was not uploaded successfully.'
                });
                return next(err);
            });
            req.flash('success', {
                msg: 'File was uploaded successfully.'
            });
            return res.redirect('/upload');
        });
        //Not a post, so it must be a style upload (wall, floor, etc.)
    } else {
        //See if that type of upload has already happened, delete if so.
        Style.findOne({
            id: req.user.id,
            type: req.body.type
        }).exec((err, style) => {
            //Only try to delete if the style already exists in database.
            if (style != null) {
                //Remove style from the server directory.
                fs.exists('./public/uploads/' + style.fileName, function(exists) {
                    if (exists) {
                        console.log('File exists. Deleting now ...');
                        fs.unlink('./public/uploads/' + style.fileName);
                    } else {
                        console.log('File not found, so not deleting.');
                    }
                });
                //Remove the style from the database.
                Style.findOne({
                    id: req.user.id,
                    type: req.body.type
                }).remove().exec();
            }

            //Setup the new style for database.
            const newStyle = new Style({
                id: req.user.id,
                fileName: req.file.filename,
                type: req.body.type
            });

            //Save the new style for the database.
            newStyle.save((err) => {
                if (err) {
                    req.flash('failure', {
                        msg: 'File was not uploaded successfully.'
                    });
                    return next(err);
                }
            });
            req.flash('success', {
                msg: 'File was uploaded successfully.'
            });
            return res.redirect('/upload');
        });
    }
};

/***
 * GET /api/rooms/:roomId/posts/:postId
 * Returns the image associate with this post in this room
 */
exports.getPost = (req, res, next) => {
    //Get the requested parameters
    let roomId = req.params.roomId;
    let postId = req.params.postId;

    //Verify that the room exists in the database
    Room.findOne({
        _id: roomId
    }).lean().exec((err, foundRoom) => {
        //Get all of the posts from the room
        Post.find({
            id: roomId
        }).lean().exec((err, posts) => {
            //Extract all of the data about the posts
            paths = [];
            for (var i = 0; i < posts.length; i++) {
                var object = posts[i];
                paths.push(
                    object.fileName
                );
            }
            //Verify that the room actually has a post for this id
            if(postId > paths.length - 1)
            {
                //This postId doesn't exist in room, error image
                res.sendFile(path.resolve(__dirname + '/../public/honda.jpg'));
            }
            else
            {
                //The image exists, return it
                let filename = paths[postId];
                res.sendFile(path.resolve(__dirname + '/../public/uploads/' + filename));
            }
        });
    });
};

/***
 * POST /api/rooms/makeRoom/:roomName
 * Creates a room with a given name
 */
exports.makeRoom = (req, res, next) => {
    let roomName = req.params.roomName;
    let userId = req.body.userId;

    const newRoom = new Room({
        name: roomName,
        userId: userId
    });

    //TODO: See if the room already exists
    //Save the new room to the database.
    newRoom.save((err) => {
        if (err) {
            return next(err);
        }
        else {
            //Add this room to the list of user rooms
            User.findOne({
                _id: userId
            }).exec((err, user) => {
                user.addRoom(newRoom._id);
                res.send("Room success");
            });
        }
    });
};

/***
 * POST /api/rooms/:roomId/tagRoom/:tagId
 * Tags an existing room w/ an existing tag
 */
exports.tagRoom = (req, res, next) => {
    let roomId = req.params.roomId;
    let tagId = req.params.tagId;

    Room.findOne({
        _id: roomId
    }).exec((err, room) => {
        room.addTag(tagId);
        res.send("Tag set");
    });
};
