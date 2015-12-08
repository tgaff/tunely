var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/tunely_test");
var Album = require('./album');
var Song = require('./song');

module.exports.Album = Album;
module.exports.Song = Song;
