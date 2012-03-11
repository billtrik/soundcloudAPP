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

  snd.my_playlists = snd.Playlists(snd.db_prefix);

  snd.current_songs = {};

  snd.nowPlaying = {
    obj: null,
    element: null
  };

  snd.song_item_template = snd.hogan.compile('\
  <li class="song_item clearfix" data-id="{{id}}">\
    <div class="image_div">\
      <img src="{{artwork_url}}" />\
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
        <button class="btn btn-success create" type="submit">{{button_text}}</button>\
      </div>\
    </form>\
  </li>');

  snd.playlist_item_template = snd.hogan.compile('\
  <li class="playlist_item" data-id="{{id}}">\
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

  snd.playlist_popup_template = snd.hogan.compile('\
  <li class="playlist_popup_item">\
    <button class="add_here" data-id="{{id}}">{{title}}</button>\
  </li>');

  snd.setHandlersForExistingPlaylistItem = function(element) {
    var delete_button, edit_button;
    edit_button = element.find(".edit");
    delete_button = element.find(".delete");
    delete_button.on('click', function(e) {
      var my_data_id, my_li;
      e.stop();
      my_li = $(this).parents("li");
      my_data_id = parseInt(my_li.attr("data-id"), 10);
      snd.my_playlists.remove(my_data_id);
      my_li.remove();
      return false;
    });
    return edit_button.on('click', function(e) {
      var $new_item, my_data_id, my_li, playlist, previous;
      e.stop();
      my_li = $(this).parents("li");
      my_data_id = parseInt(my_li.attr("data-id"), 10);
      playlist = snd.my_playlists.search(my_data_id);
      playlist.button_text = "Update It";
      $new_item = $(snd.playlist_new_template.render(playlist));
      delete playlist.button_text;
      snd.setHandlersForUpdatingPlaylistItem($new_item, playlist);
      if ((previous = my_li.previous()).length === 0) {
        $("#playlists_list ol").prepend($new_item);
      } else {
        previous.after($new_item);
      }
      my_li.remove();
      return false;
    });
  };

  snd.setHandlersForUpdatingPlaylistItem = function(element, playlist) {
    var create_button;
    create_button = element.find(".create");
    return create_button.on('click', function(e) {
      var $new_item, my_li, previous;
      e.stop();
      my_li = $(this).parents("li");
      playlist.title = my_li.find(".title").val();
      playlist.description = my_li.find(".desc").val();
      snd.my_playlists.update(playlist);
      $new_item = $(snd.playlist_item_template.render(playlist));
      snd.setHandlersForExistingPlaylistItem($new_item);
      if ((previous = my_li.previous()).length === 0) {
        $("#playlists_list ol").prepend($new_item);
      } else {
        previous.after($new_item);
      }
      my_li.remove();
      return false;
    });
  };

  snd.initialize_soundcloud = function() {
    SC.initialize({
      client_id: snd.client_id,
      redirect_uri: snd.redirect_uri
    });
  };

  snd.getTracks = function() {
    SC.get("/tracks", {
      limit: 2
    }, function(tracks) {
      var track, _i, _len;
      for (_i = 0, _len = tracks.length; _i < _len; _i++) {
        track = tracks[_i];
        snd.current_songs[track.id] = track;
      }
      snd.renderSongs(tracks);
    });
  };

  snd.renderSongs = function(data) {
    var $new_item, data_item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      data_item = data[_i];
      data_item.duration = secondsToTime(data_item.duration);
      $new_item = $(snd.song_item_template.render(data_item));
      snd.setHandlersForNewMusicItem($new_item);
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

  snd.setHandlersForNewMusicItem = function(item) {
    var song_id;
    song_id = item.attr("data-id");
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
    item.find(".playlist_me").on('click', function() {
      var $new_item, data_item, ul, _i, _len, _ref, _results;
      $("#playlists_popup").show();
      ul = $("#playlists_popup ul");
      _ref = snd.my_playlists.list;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data_item = _ref[_i];
        if (data_item.active === true) {
          $new_item = $(snd.playlist_popup_template.render(data_item));
          snd.setHandlersPlaylistPopupItem($new_item, song_id);
          _results.push(ul.append($new_item));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
  };

  snd.setHandlersPlaylistPopupItem = function(element, song_id) {
    element.find(".add_here").on('click', function() {
      var my_playlist_id, my_song_id;
      my_playlist_id = parseInt($(this).attr("data-id"), 10);
      my_song_id = song_id;
      return snd.my_playlists.list[my_playlist_id].add_song(snd.current_songs[my_song_id]);
    });
  };

  snd.printExistingPlaylists = function() {
    var $new_item, index, playlist, _ref;
    _ref = snd.my_playlists.list;
    for (index in _ref) {
      playlist = _ref[index];
      if (playlist.active === true) {
        $new_item = $(snd.playlist_item_template.render(playlist));
        snd.setHandlersForExistingPlaylistItem($new_item);
        $("#playlists_list ol").prepend($new_item);
      }
    }
  };

  snd.setHandlersForNewPlaylistItem = function(element) {
    var create_button;
    create_button = element.find(".create");
    return create_button.on('click', function(e) {
      var $new_item, my_desc, my_li, my_title, new_playlist;
      e.stop();
      my_li = $(this).parents("li");
      my_title = my_li.find(".title").val();
      my_desc = my_li.find(".desc").val();
      new_playlist = snd.my_playlists.create({
        title: my_title,
        description: my_desc
      });
      my_li.remove();
      $new_item = $(snd.playlist_item_template.render(new_playlist));
      snd.setHandlersForNewPlaylistItem($new_item);
      $("#playlists_list ol").prepend($new_item);
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
      $new_item = $(snd.playlist_new_template.render({
        button_text: "Create It"
      }));
      snd.setHandlersForNewPlaylistItem($new_item);
      return $("#playlists_list ol").prepend($new_item);
    });
    snd.initialize_soundcloud();
    snd.getTracks();
    return snd.printExistingPlaylists();
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
    snd.getUserDetails = function() {};
    return SC.get("/me", function(me) {
      $("#username").text(me.username);
      return $("#description").val(me.description);
    });
  };

}).call(this);
