// SERVER-SIDE JAVASCRIPT

//require express in our app
var express = require('express');
// generate a new express app and call it 'app'
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// serve static files from public folder
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

/************
 * DATABASE *
 ************/

var db = require('./models');

/**********
 * ROUTES *
 **********/

/*
 * HTML Endpoints
 */

app.get('/', function homepage (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


/*
 * JSON API Endpoints
 */

app.get('/api', function api_index (req, res){
  res.json({
    message: "Welcome to tunely!",
    documentation_url: "https://github.com/tgaff/tunely/api.md",
    base_url: "http://tunely.herokuapp.com",
    endpoints: [
      {method: "GET", path: "/api", description: "Describes available endpoints"}
    ]
  });
});

app.get('/api/albums', function albumsIndex(req, res) {
  db.Album.find({}, function(err, albums) {
    res.json(albums);
  });
});

app.post('/api/albums', function albumCreate(req, res) {
  console.log('body', req.body);

  // split at comma and remove and trailing space
  var genres = req.body.genres.split(',').map(function(item) { return item.trim(); } );
  req.body.genres = genres;

  db.Album.create(req.body, function(err, album) {
    if (err) { console.log('error', err); }
    console.log(album);
    res.json(album);
  });

});


app.get('/api/albums/:id', function albumShow(req, res) {
  console.log('requested album id=', req.params.id);
  db.Album.findOne({_id: req.params.id}, function(err, album) {
    res.json(album);
  });
});


app.post('/api/albums/:albumId/songs', function songsCreate(req, res) {
  console.log('body', req.body);
  db.Album.findOne({_id: req.params.albumId}, function(err, album) {
    if (err) { console.log('error', err); }

    var song = new db.Song(req.body);
    album.songs.push(song);
    album.save(function(err, savedAlbum) {
      if (err) { console.log('error', err); }
      console.log('album with new song saved:', savedAlbum);
      res.json(song);
    });
  });
});

app.delete('/api/albums/:id', function deleteAlbum(req, res) {
  console.log('deleting id: ', req.params.id);
  db.Album.remove({_id: req.params.id}, function(err) {
    if (err) { return console.log(err); }
    console.log("removal of id=" + req.params.id  + " successful.");
    res.status(200).send(); // everything is a-OK
  });
});

app.put('/api/albums/:id', function updateAlbum(req, res) {
  console.log('updating id ', req.params.id);
  console.log('received body ', req.body);

  db.Album.findOne({_id: req.params.id}, function(err, foundAlbum) {
    if (err) { console.log('error', err); }
    foundAlbum.artistname = req.body.artistName;
    foundAlbum.name = req.body.name;
    foundAlbum.releaseDate = req.body.releaseDate;
    foundAlbum.save(function(err, saved) {
      if(err) { console.log('error', err); }
      res.json(saved);
    });
  });
});


/**********
 * SERVER *
 **********/

// listen on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is running on http://localhost:3000/');
});
