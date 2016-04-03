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


  // catch and handle the click on an add song button
  $('#albums').on('click', '.add-song', handleAddSongClick);

  // save song modal save button
  $('#saveSong').on('click', handleNewSongSubmit);
  $('#albums').on('click', '.delete-album', handleDeleteAlbumClick);
  $('#albums').on('click', '.edit-album', handleAlbumEditClick);
  $('#albums').on('click', '.save-album', handleSaveChangesClick);
  $('#albums').on('click', '.edit-songs', handleEditSongsClick);
});

// when edit songs button clicked
function handleEditSongsClick(e) {
  var $albumRow = $(this).closest('.album');
  var albumId = $albumRow.data('album-id');
  console.log('edit songs clicked for ', albumId);
  // seems we need the list of songs here - later, when you see full front-end
  // frameworks, this'll be a little easier, for now - lets request the data we need
  $.get('/api/albums/' + albumId + "/songs", function(songs) {
    console.log('got back songs: ', songs);
    populateEditSongsModal(songs);
    // fire zee modal!
    $('#editSongsModal').modal();
  });
}

// takes an array of songs and generates an EDIT form for them
function populateEditSongsModal(songs) {
  // prep the template
  var templateHtml = $('#song-edit-template').html();
  var template = Handlebars.compile(templateHtml);
  // use the template's #each to render all songs at once
  songsForms = template({songs: songs});
  // find the modal's body and replace it with the generated html
  $('#editSongsModalBody').html(songsForms);
}

// when the edit button for an album is clicked
function handleAlbumEditClick(e) {
  var $albumRow = $(this).closest('.album');
  var albumId = $albumRow.data('album-id');
  console.log('edit album', albumId);

  // show the save changes button
  $albumRow.find('.save-album').toggleClass('hidden');
  // hide the edit button
  $albumRow.find('.edit-album').toggleClass('hidden');


  // get the album name and replace its field with an input element
  var albumName = $albumRow.find('span.album-name').text();
  $albumRow.find('span.album-name').html('<input class="edit-album-name" value="' + albumName + '"></input>');

  // get the artist name and replace its field with an input element
  var artistName = $albumRow.find('span.artist-name').text();
  $albumRow.find('span.artist-name').html('<input class="edit-artist-name" value="' + artistName + '"></input>');

  // get the releasedate and replace its field with an input element
  var releaseDate = $albumRow.find('span.album-releaseDate').text();
  $albumRow.find('span.album-releaseDate').html('<input class="edit-album-releaseDate" value="' + releaseDate + '"></input>');
}

// after editing an album, when the save changes button is clicked
function handleSaveChangesClick(e) {
  var albumId = $(this).parents('.album').data('album-id'); // $(this).closest would have worked fine too
  var $albumRow = $('[data-album-id=' + albumId + ']');

  var data = {
    name: $albumRow.find('.edit-album-name').val(),
    artistName: $albumRow.find('.edit-artist-name').val(),
    releaseDate: $albumRow.find('.edit-album-releaseDate').val()
  };
  console.log('PUTing data for album', albumId, 'with data', data);

  $.ajax({
    method: 'PUT',
    url: '/api/albums/' + albumId,
    data: data,
    success: handleAlbumUpdatedResponse
  });
}

function handleAlbumUpdatedResponse(data) {
  console.log('response to update', data);

  var albumId = data._id;
  // scratch this album from the page
  $('[data-album-id=' + albumId + ']').remove();
  // and then re-draw it with the updates ;-)
  renderAlbum(data);

  // BONUS: scroll the change into view ;-)
  $('[data-album-id=' + albumId + ']')[0].scrollIntoView();
}

function handleDeleteAlbumClick(e) {
  var albumId = $(this).parents('.album').data('album-id');
  console.log('someone wants to delete album id=' + albumId );
  $.ajax({
    url: '/api/albums/' + albumId,
    method: 'DELETE',
    success: handleDeleteAlbumSuccess
  });
}

// callback after DELETE /api/albums/:id
function handleDeleteAlbumSuccess(data) {
  var deletedAlbumId = data._id;
  console.log('removing the following album from the page:', deletedAlbumId);
  $('div[data-album-id=' + deletedAlbumId + ']').remove();
}


// this function takes a single album and renders it to the page
function renderAlbum(album) {
  console.log('rendering album', album);
  var albumHtml = $('#album-template').html();
  var albumsTemplate = Handlebars.compile(albumHtml);
  var html = albumsTemplate(album);
  $('#albums').prepend(html);
}

// when the add song button is clicked, display the modal
function handleAddSongClick(e) {
  console.log('add-song clicked!');
  var currentAlbumId = $(this).closest('.album').data('album-id'); // "5665ff1678209c64e51b4e7b"
  console.log('id',currentAlbumId);
  $('#songModal').data('album-id', currentAlbumId);
  $('#songModal').modal();  // display the modal!
}

// when the song modal submit button is clicked:
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
    $.get('/api/albums/' + albumId, function(data) {
      // remove the current instance of the album from the page
      $('[data-album-id=' + albumId + ']').remove();
      // re-render it with the new album data (including songs)
      renderAlbum(data);
    });
  }).error(function(err) {
    console.log('post to /api/albums/:albumId/songs resulted in error', err);
  });
}
