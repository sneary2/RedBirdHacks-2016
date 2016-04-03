var CLIENT_ID = '6J3en3fBc6nDWHx1M0skJ4bVG-Z-itHjzA4F08Jl';
var CLIENT_SECRET = 'OF5c4cLlxNWi2aJDbnZZlLvaU8Aes1VMm63afJSI';

function getCredentials(cb) {
  var data = {
    'grant_type': 'client_credentials',
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET
  };

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/token',
    'data': data,
    'type': 'POST'
  })
  .then(function(r) {
    localStorage.setItem('accessToken', r.access_token);
    localStorage.setItem('tokenTimestamp', Math.floor(Date.now() / 1000));
    cb();
  });
}

function postImage(imgurl) {
  var data = {
    'url': imgurl
  };
  var accessToken = localStorage.getItem('accessToken');

  return $.ajax({
    'url': 'https://api.clarifai.com/v1/tag',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    },
    'data': data,
    'type': 'POST'
  }).then(function(r){
    parseResponse(r);
  });
}

function parseResponse(resp) {
  var tags = [];
  var probs = [];
  if (resp.status_code === 'OK') {
    var results = resp.results;
    tags = results[0].result.tag.classes;
  } else {
    console.log('Sorry, something is wrong.');
  }

  // FIXME make a montage
  console.log(tags.toString().replace(/,/g, ', '));
  $.ajax({
    'url': '/songs_by_tag',
    'data': {'tag': tags[0]},
    'type': 'POST'
  })
  .then(function(r) {
    MRP.insert({
    'url':'http://localhost:8000/' + r['folder-name'] + '/' + r.songs[0],
    'codec':'mp3',
    'volume':100,
    'autoplay':false,
    'buffering':5,
    'title':'Synesthesia',
    'bgcolor':'#FFFFFF',
    'skin':'mcclean',
    'width':180,
    'height':60
    });
  }); 
  return tags;
}

function doMakeMontage(imgurl) {
  if (localStorage.getItem('tokenTimeStamp') - Math.floor(Date.now() / 1000) > 86400
    || localStorage.getItem('accessToken') === null) {
    getCredentials(function() {
      postImage(imgurl);
    });
  } else {
    postImage(imgurl);
  }
}

var counter = 0;
var albumReqLimit = 100;
var reqLimit = 10;
var options = '';
var addToSelectBox = function(imgUrl) {
  $('#photo-selector').append('<option data-img-src="' + imgUrl + '" value="' + counter + '">Image ' + counter + '</option>');
  $("#photo-selector").imagepicker();
  counter++;
};
var proposeToSelectBox = function(imgUrl) {
  options += '<option data-img-src="' + imgUrl + '" value="' + counter + '">Image ' + counter + '</option>\n';
  counter++;
}
var commitProposalsToSelectBox = function() {
  $('#photo-selector').append(options);
  options = '';
  $("#photo-selector").imagepicker();
}
var clearSelectBox = function() {
  $("#photo-selector").empty();
  var elem = $('ul.image_picker_image');
  if (elem != null) {
    elem.remove();
  }
  counter = 0;
  options = '';
}
var populatePhotos = function() {
  console.log('Populating photos...');
  FB.api(
    '/me',
    'GET',
    {"fields":"albums.fields(photos.limit(99999).fields(id))","limit":"99999"},
    function(response) {
      var ready = false;
      var countIn = 0;
      var countOut = 0;
      var photo_data = response.albums.data;
      clearSelectBox();
      $('#loading').show();
      var kMax = photo_data.length;
      if (albumReqLimit != null && kMax > albumReqLimit) {
        kMax = albumReqLimit;
      }
      for (var k = 0; k != kMax; k++) {
        var data_arr = photo_data[k].photos.data;
        var mMax = data_arr.length;
        if (reqLimit != null && mMax > reqLimit) {
          mMax = reqLimit;
        }
        for (var m = 0; m != mMax; m++) {
          countIn++;
          var photo_id = data_arr[m].id;
          FB.api(
            '/' + photo_id + '/picture',
            'GET',
            {},
            function(response) {
              countOut++;
              var url = response.data.url;
              proposeToSelectBox(url);
              if (ready && countIn == countOut) {
                // Last asynchronous call after function finished
                $('#loading').hide();
                commitProposalsToSelectBox();
              }
            }
          );
        }
      }
      if (countIn == countOut) {
        // Asynchronous calls finished before we reached here (very rare
        // case)
        $('#loading').hide();
        commitProposalsToSelectBox();
      } else {
        ready = true;
      }
    }
  );
}
var loginToFb = function() {
  FB.getLoginStatus(function(response) {
    if (response.authResponse) {
      populatePhotos();
    } else {
      console.log('Authorization failed.');
    }
  },{scope: 'user_photos'});
}
var selectAll = function() {
  $('#photo-selector > option').prop('selected', true);
  $("#photo-selector").imagepicker();
}
var deselectAll = function() {
  $('#photo-selector > option').prop('selected', false);
  $("#photo-selector").imagepicker();
}
var makeMontage = function() {
  $('#photo-selector > option').filter(function() {
    return $(this).prop('selected');
  }).each(function() {
    var url = $(this).attr('data-img-src');
    console.log(url);
    doMakeMontage(url); // FIXME incomplete
  });
}
