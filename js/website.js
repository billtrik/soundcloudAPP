(function() {
  var secondsToTime, snd;

  snd = window.SOUNDTEST = window.SOUNDTEST || {};

  snd.client_id = '120a55b8b9d07b69a72faa9f4874f36d';

  snd.url = 'http://api.soundcloud.com/';

  snd.redirect_uri = "http://soundcloud.billtrik.gr/callback.html";

  snd.hogan = Hogan;

  snd.timeoutVar = null;

  snd.db = snd.db || null;

  snd.db_prefix = "SND_app_";

  snd.playlists = [];

  snd.nowPlaying = {
    obj: null,
    element: null
  };

  snd.song_item_template = snd.hogan.compile('\
  <li class="song_item clearfix">\
    <div class="image_div">\
      {{#artwork_url?}}\
        <img src="{{artwork_url}}" />\
      {{/artwork_url?}}\
    </div>\
    <div class="details">\
      <h5>{{title}}</h5>\
      <p class="current_time">00:00</p><span>/</span>\
      <p class="duration">{{duration}}</p>\
      <div class="buttons">\
        <button class="play_me btn btn-success" data-id="{{id}}">Play</button>\
        <button class="playlist_me btn btn-inverse" data-id="{{id}}">PlaylistMe</button>\
      </div>\
    </div>\
  </li>');

  snd.playlist_new_template = snd.hogan.compile('\
  <li class="playlist_item" data-id="{{playlist_id}}">\
    <form class="new_playlist">\
      <div class="title_cont">\
        <input class="title" name="title" placeholder="Insert Title" value="{{title}}">\
      </div>\
      <div class="desc_cont">\
        <textarea class="desc" name="description" placeholder="Insert Description">{{description}}</textarea>\
      </div>\
      <div class="buttons">\
        <button class="btn btn-success create" type="submit">Create It</button>\
      </div>\
    </form>\
  </li>');

  snd.playlist_item_template = snd.hogan.compile('\
  <li class="playlist_item" data-id="{{playlist_id}}">\
    <div class="title_cont">\
      <p class="title">{{title}}</p>\
    </div>\
    <div class="desc_cont">\
      <p class="desc">{{description}}</p>\
    </div>\
    \
    <div class="buttons">\
      <button class="btn btn-info edit" type="submit">Edit It</button>\
      <button class="btn btn-danger delete" type="submit">Delete It</button>\
    </div>\
  </li>');

  snd.getUserDetails = function() {
    return SC.get("/me", function(me) {
      $("#username").text(me.username);
      return $("#description").val(me.description);
    });
  };

  snd.initialize_soundcloud = function() {
    SC.initialize({
      client_id: snd.client_id,
      redirect_uri: snd.redirect_uri
    });
  };

  snd.getTracks = function() {
    return SC.get("/tracks", {
      limit: 10
    }, function(tracks) {
      return snd.renderSongs(tracks);
    });
  };

  snd.renderSongs = function(data) {
    var $new_item, data_item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      data_item = data[_i];
      data_item.duration = secondsToTime(data_item.duration);
      data_item.artwork_url = data_item.artwork_url || "#";
      $new_item = $(snd.song_item_template.render(data_item));
      snd.setHandlersFor($new_item);
      _results.push($("#songs_list ul").append($new_item));
    }
    return _results;
  };

  snd.changeButtonToStop = function(element) {
    element.removeClass("btn-success");
    element.addClass("btn-danger");
    element.html("Stop");
  };

  snd.changeButtonToPlay = function(element) {
    element.parents("li").find(".current_time").html("00:00");
    element.removeClass("btn-danger");
    element.addClass("btn-success");
    element.html("Play");
  };

  snd.timeoutfunc = function() {
    return snd.timeoutVar = setTimeout(function() {
      var current_time;
      if (snd.nowPlaying.element) {
        current_time = secondsToTime(snd.nowPlaying.obj.position);
        snd.nowPlaying.element.parents("li").find(".current_time").html(current_time);
        return snd.timeoutfunc();
      }
    }, 1000);
  };

  snd.setHandlersFor = function(item) {
    item.find(".play_me").on('click', function() {
      var me, my_id;
      if (snd.nowPlaying.element) {
        snd.changeButtonToPlay(snd.nowPlaying.element);
        snd.nowPlaying.obj.stop();
        if (snd.nowPlaying.element[0] === this) {
          snd.nowPlaying.element = null;
          return true;
        }
      }
      me = $(this);
      snd.changeButtonToStop(me);
      my_id = parseInt(me.attr("data-id"), 10);
      SC.whenStreamingReady(function() {
        var soundObj;
        soundObj = SC.stream(my_id);
        snd.nowPlaying.obj = soundObj;
        snd.nowPlaying.element = me;
        return soundObj.play({
          onplay: function() {
            return snd.timeoutfunc();
          },
          onpause: function() {},
          onstop: function() {
            clearTimeout(snd.timeoutVar);
            return snd.changeButtonToPlay(snd.nowPlaying.element);
          },
          onfinish: function() {
            snd.changeButtonToPlay(snd.nowPlaying.element);
            snd.nowPlaying.element.parents("li").find(".current_time").html("00:00");
            return snd.nowPlaying.element = null;
          }
        });
      });
    });
  };

  snd.getPlaylists = function() {
    var $new_item, index, playlist, _ref;
    if (snd.db) {
      snd.playlists = snd.db.get(snd.db_prefix + "playlists" || []);
      if (snd.playlists === false) snd.playlists = [];
      _ref = snd.playlists;
      for (index in _ref) {
        playlist = _ref[index];
        playlist.id = index;
        $new_item = $(snd.playlist_item_template.render(playlist));
        snd.handlersForNewPlaylist($new_item);
        $("#playlists_list ol").prepend($new_item);
      }
    }
  };

  snd.createPlaylist = function() {
    return new snd.Playlist({
      db_prefix: snd.db_prefix
    });
  };

  snd.editPlaylist = function() {};

  snd.handlersForNewPlaylist = function(element) {
    var create_button;
    create_button = element.find(".create");
    return create_button.on('click', function(e) {
      var my_form, my_playlist;
      e.stop();
      console.log("got click");
      my_form = $(this).parents("form");
      my_playlist = snd.createPlaylist();
      console.log(my_playlist);
      my_playlist.save({
        title: my_form.find(".title").val(),
        description: my_form.find(".desc").val()
      });
      return false;
    });
  };

  $.domReady(function() {
    $(".navbar .btn-navbar").on('click', function() {
      return $(".navbar").toggleClass("active");
    });
    $(".navbar .nav li a").on('click', function(e) {
      var my_target;
      e.stop();
      my_target = $("#" + $(this).attr("data-target"));
      $(".navbar .nav li.active").removeClass("active");
      $(this).parent().addClass("active");
      $(".content_div.active").removeClass("active");
      my_target.addClass("active");
      $(".navbar").removeClass("active");
      return false;
    });
    $("#create_playlist_button").on('click', function() {
      var $new_item;
      $new_item = $(snd.playlist_new_template.render({}));
      snd.handlersForNewPlaylist($new_item);
      return $("#playlists_list ol").prepend($new_item);
    });
    snd.initialize_soundcloud();
    snd.getTracks();
    return snd.getPlaylists();
  });

  secondsToTime = function(secs) {
    var divisor_for_minutes, divisor_for_seconds, hours, minutes, seconds;
    secs = secs / 1000;
    hours = Math.floor(secs / (60 * 60));
    if (hours < 10) hours = "0" + hours;
    divisor_for_minutes = secs % (60 * 60);
    minutes = Math.floor(divisor_for_minutes / 60);
    if (minutes < 10) minutes = "0" + minutes;
    divisor_for_seconds = divisor_for_minutes % 60;
    seconds = Math.ceil(divisor_for_seconds);
    if (seconds < 10) seconds = "0" + seconds;
    return minutes + ":" + seconds;
  };

}).call(this);
