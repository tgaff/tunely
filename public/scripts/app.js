/* CLIENT-SIDE JS
 *
 * You may edit this file as you see fit.  Try to separate different components
 * into functions and objects as needed.
 *
 */


$(document).ready(function() {
  console.log('app.js loaded!');
  $.get('/api/albums').success(function (albums) {
    albums.forEach(function(album) {
      renderAlbum(album);
    });
  });

  $('#album-form form').on('submit', function(e) {
    e.preventDefault();
    var formData = $(this).serialize();
    console.log('formData', formData);
    $.post('/api/albums', formData, function(album) {
      console.log('album after POST', album);
      renderAlbum(album);  //render the server's response
    });
    $(this).trigger("reset");
  });



  $('#albums').on('click', '.add-song', function(e) {
      console.log('add-song clicked!');
      var currentAlbumId = $(this).closest('.album').data('album-id'); // "5665ff1678209c64e51b4e7b"
      console.log('id',currentAlbumId);
      $('#songModal').data('album-id', currentAlbumId);
      $('#songModal').modal();  // display the modal!
  });

  // save song modal save button
  $('#saveSong').on('click', handleNewSongSubmit);

});



// this function takes a single album and renders it to the page
function renderAlbum(album) {
  console.log('rendering album:', album);
  var albumHtml = $('#album-template').html();
  var albumsTemplate = Handlebars.compile(albumHtml);
  var html = albumsTemplate(album);
  $('#albums').prepend(html);
}

function handleNewSongSubmit(e) {
  e.preventDefault();
  var $modal = $('#songModal');
  var $songNameField = $modal.find('#songName');
  var $trackNumberField = $modal.find('#trackNumber');

  // get data from modal fields
  // note the server expects the keys to be 'name', 'trackNumber' so we use those.
  var dataToPost = {
    name: $songNameField.val(),
    trackNumber: $trackNumberField.val()
  };
  var albumId = $modal.data('albumId');
  console.log('retrieved songName:', songName, ' and trackNumber:', trackNumber, ' for album w/ id: ', albumId);
  // POST to SERVER
  var songPostToServerUrl = '/api/albums/'+ albumId + '/songs';
  $.post(songPostToServerUrl, dataToPost, function(data) {
    console.log('received data from post to /songs:', data);
    // clear form
    $songNameField.val('');
    $trackNumberField.val('');

    // close modal
    $modal.modal('hide');
    // update the correct album to show the new song
    // Note there are a couple of ways we could do this.
    // 1. re-retrieve the entire album and call renderAlbum with it (cost: extra server round-trip)
    // 2. allow the server to respond with the entire album and then renderAlbum (slightly less standard)
    console.log('for now lets log the results and wait till we have the server setup:', data);
  }).error(function(err) {
    console.log('post to /api/albums/:albumId/songs resulted in error', err);
  });
}
