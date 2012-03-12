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

  snd.playlist_song_item_template = snd.hogan.compile('\
  <li class="song_item clearfix" data-id="{{id}}">\
    <div class="image_div">\
      <img src="{{artwork_url}}" />\
    </div>\
    <div class="details">\
      <h5>{{title}}</h5>\
      <p class="duration">{{duration}}</p>\
      <div class="buttons">\
        <button class="remove_me btn btn-danger" data-id="{{id}}">Remove Me</button>\
      </div>\
    </div>\
  </li>');

  snd.song_in_playlist = snd.hogan.compile('\
  <li class="song_item clearfix" data-id="{{id}}">\
    <div class="image_div">\
      <img src="{{artwork_url}}" />\
    </div>\
    <div class="details">\
      <h5>{{title}}</h5>\
      <p class="current_time">00:00</p><span>/</span>\
      <p class="duration">{{duration}}</p>\
    </div>\
  </li>');

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
        <button class="btn btn-small btn-success create" type="submit">{{button_text}}</button>\
      </div>\
    </form>\
  </li>');

  snd.playlist_item_template = snd.hogan.compile('\
  <li class="playlist_item" data-id="{{id}}">\
    <div class="title_cont">\
      <p class="title"><span>Title:</span>{{title}}</p>\
    </div>\
    <div class="desc_cont">\
      <p class="desc"><span>Description:</span>{{description}}</p>\
    </div>\
    \
    <div class="buttons">\
      <button class="btn btn-small btn-info edit" >Edit It</button>\
      <button class="btn btn-small btn-danger delete" >Delete It</button>\
      <button class="btn btn-small show_songs" >Show Songs</button>\
      <button class="btn btn-small btn-success play_all">Play All</button>\
    </div>\
\
    <div class="songs_list">\
      <ul class="clearfix"></ul>\
    </div>\
  </li>');

  snd.playlist_popup_template = snd.hogan.compile('\
  <li class="playlist_popup_item">\
    <button class="btn btn-primary add_here" data-id="{{id}}">{{title}}</button>\
  </li>');

  snd.setHandlersForExistingPlaylistItem = function(element) {
    var delete_button, edit_button, my_id, my_playlist, my_songs_ul, play_all_buttons, show_songs_button;
    edit_button = element.find(".edit");
    delete_button = element.find(".delete");
    show_songs_button = element.find(".show_songs");
    play_all_buttons = element.find(".play_all");
    my_id = element.attr("data-id");
    my_playlist = snd.my_playlists.list[my_id];
    my_songs_ul = element.find(".songs_list ul");
    delete_button.on('click', function(e) {
      var my_data_id, my_li;
      e.stop();
      my_li = $(this).parents("li");
      my_data_id = parseInt(my_li.attr("data-id"), 10);
      snd.my_playlists.remove(my_data_id);
      my_li.remove();
      return false;
    });
    edit_button.on('click', function(e) {
      var $new_item, my_data_id, my_li, playlist, previous;
      e.stop();
      my_li = $(this).parents("li");
      my_data_id = parseInt(my_li.attr("data-id"), 10);
      playlist = snd.my_playlists.get(my_data_id);
      playlist.button_text = "Update It";
      $new_item = $(snd.playlist_new_template.render(playlist));
      delete playlist.button_text;
      snd.setHandlersForUpdatingPlaylistItem($new_item, playlist);
      if ((previous = my_li.previous()).length === 0) {
        $("#playlists_list > ul").prepend($new_item);
      } else {
        previous.after($new_item);
      }
      my_li.remove();
      return false;
    });
    play_all_buttons.on('click', function(e) {
      var $new_item, index, song, target_ul, _ref;
      e.stop();
      target_ul = $("#active_playlist_list ul");
      target_ul.empty();
      _ref = my_playlist.songs_list;
      for (index in _ref) {
        song = _ref[index];
        $new_item = $(snd.song_in_playlist.render(song));
        target_ul.append($new_item);
      }
      $(".span12 .active").removeClass("active");
      $(".navbar .nav .active").removeClass("active");
      $("#active_playlist_list").addClass("active");
      $("#active_playlist_button").parent().addClass("active");
      $("#active_button_play").click();
      return false;
    });
    return show_songs_button.on('click', function(e) {
      var $new_item, index, song, _ref;
      e.stop();
      if (element.find(".songs_list").hasClass("active") === false) {
        my_songs_ul.empty();
        _ref = my_playlist.songs_list;
        for (index in _ref) {
          song = _ref[index];
          $new_item = $(snd.playlist_song_item_template.render(song));
          $new_item.find(".remove_me").on('click', function(e) {
            var my_playlist_id, my_song_id;
            e.stop();
            my_song_id = $(this).attr("data-id");
            my_playlist_id = $(this).parents(".playlist_item").attr("data-id");
            snd.my_playlists.list[my_playlist_id].remove_song(my_song_id);
            $(this).parents(".song_item").remove();
            return false;
          });
          snd.setHandlersForExistingPlaylistItem($new_item);
          my_songs_ul.append($new_item);
        }
      }
      element.find(".songs_list").toggleClass("active");
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
        $("#playlists_list > ul").prepend($new_item);
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
      limit: 12
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
    if (element === void 0) return;
    element.removeClass("btn-success");
    element.addClass("btn-danger");
    element.html("Stop");
  };

  snd.changeButtonToPlay = function(element) {
    if (element === void 0) return;
    element.parents("li").find(".current_time").html("00:00");
    element.removeClass("btn-danger");
    element.addClass("btn-success");
    element.html("Play");
  };

  snd.timeoutfunc = function() {
    return snd.timeoutVar = setTimeout(function() {
      var current_time;
      if (snd.nowPlaying.li) {
        current_time = secondsToTime(snd.nowPlaying.obj.position);
        snd.nowPlaying.li.find(".current_time").html(current_time);
        return snd.timeoutfunc();
      }
    }, 1000);
  };

  snd.playItemInPlaylist = function(params) {
    SC.whenStreamingReady(function() {
      var soundObj;
      soundObj = SC.stream(params.id);
      snd.nowPlaying.obj = soundObj;
      snd.nowPlaying.li = params.li;
      soundObj.play({
        onplay: function() {
          clearTimeout(snd.timeoutVar);
          return snd.timeoutfunc();
        },
        onpause: function() {
          return console.log("onpause");
        },
        onstop: function() {
          console.log("onstop");
          return clearTimeout(snd.timeoutVar);
        },
        onerror: function() {
          return console.log("error");
        },
        onfinish: function() {
          var new_element;
          snd.nowPlaying.li.find(".current_time").html("00:00");
          params.li.removeClass("nowplaying");
          new_element = snd.nowPlaying.li.next();
          if (new_element.length > 0) {
            new_element.addClass("nowplaying");
            return snd.playItemInPlaylist({
              id: new_element.attr("data-id"),
              li: new_element
            });
          } else {
            snd.nowPlaying.obj = null;
            return snd.nowPlaying.li = null;
          }
        }
      });
    });
  };

  snd.setHandlersForActivePlaylist = function() {
    $("#active_button_play").on('click', function() {
      var active_song, my_id;
      active_song = $("#active_playlist_list .song_item.nowplaying");
      if (active_song.length === 1 && snd.nowPlaying.li) return false;
      if (snd.nowPlaying.li) {
        if (snd.nowPlaying.button && snd.nowPlaying.button.length > 0) {
          snd.changeButtonToPlay(snd.nowPlaying.button);
        }
        snd.nowPlaying.obj.stop();
      }
      if (active_song.length === 0) {
        active_song = $("#active_playlist_list .song_item").first();
      }
      if (active_song.length === 0) return false;
      active_song.addClass("nowplaying");
      my_id = active_song.attr("data-id");
      snd.playItemInPlaylist({
        id: my_id,
        li: active_song
      });
    });
    $("#active_controls .prevnext").on('click', function(e) {
      var active_song, my_id;
      e.preventDefault();
      my_id = $(this).attr("id");
      active_song = $("#active_playlist_list .song_item.nowplaying");
      if (active_song.length === 0) {
        active_song = $("#active_playlist_list .song_item").first();
        active_song.addClass("nowplaying");
      }
      if (active_song.length === 0) return false;
      if (my_id === "active_button_prev") {
        if (active_song.previous().length === 0) return false;
      } else {
        if (active_song.next().length === 0) return false;
      }
      active_song.find(".current_time").html("00:00");
      active_song.removeClass("nowplaying");
      if (my_id === "active_button_prev") {
        active_song = active_song.previous();
      } else {
        active_song = active_song.next();
      }
      active_song.addClass("nowplaying");
      if (snd.nowPlaying.li) {
        if (snd.nowPlaying.button && snd.nowPlaying.button.length > 0) {
          snd.changeButtonToPlay(snd.nowPlaying.button);
        }
        snd.nowPlaying.obj.stop();
        my_id = active_song.attr("data-id");
        return snd.playItemInPlaylist({
          id: my_id,
          li: active_song
        });
      }
    });
    $("#active_button_stop").on('click', function() {
      var active_song;
      active_song = $("#active_playlist_list .song_item.nowplaying");
      if (active_song.length === 0) return false;
      if (snd.nowPlaying.li) {
        if (snd.nowPlaying.button && snd.nowPlaying.button.length > 0) {
          snd.changeButtonToPlay(snd.nowPlaying.button);
        }
        snd.nowPlaying.obj.stop();
      }
      active_song.find(".current_time").html("00:00");
      active_song.removeClass("nowplaying");
      snd.nowPlaying.obj = null;
      snd.nowPlaying.li = null;
      return snd.nowPlaying.obj = null;
    });
  };

  snd.setHandlersForNewMusicItem = function(item) {
    var song_id;
    song_id = item.attr("data-id");
    item.find(".play_me").on('click', function() {
      var me, my_id;
      if (snd.nowPlaying.li) {
        snd.changeButtonToPlay(snd.nowPlaying.button);
        snd.nowPlaying.obj.stop();
        if (snd.nowPlaying.button && snd.nowPlaying.button[0] === this) {
          snd.nowPlaying.li = null;
          snd.nowPlaying.button = null;
          snd.nowPlaying.obj = null;
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
        snd.nowPlaying.li = me.parents("li");
        snd.nowPlaying.button = me;
        return soundObj.play({
          onplay: function() {
            return snd.timeoutfunc();
          },
          onpause: function() {},
          onstop: function() {
            clearTimeout(snd.timeoutVar);
            return snd.changeButtonToPlay(snd.nowPlaying.button);
          },
          onfinish: function() {
            snd.changeButtonToPlay(snd.nowPlaying.button);
            snd.nowPlaying.li.find(".current_time").html("00:00");
            snd.nowPlaying.li = null;
            snd.nowPlaying.button = null;
            return snd.nowPlaying.obj = null;
          }
        });
      });
    });
    item.find(".playlist_me").on('click', function() {
      var $new_item, data_item, ul, _i, _len, _ref, _results;
      $("#playlists_popup").show("block");
      ul = $("#playlists_popup ul");
      ul.empty();
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
      snd.my_playlists.list[my_playlist_id].add_song(snd.current_songs[my_song_id]);
      return $("#playlists_popup").hide();
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
        $("#playlists_list > ul").prepend($new_item);
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
      snd.setHandlersForExistingPlaylistItem($new_item);
      $("#playlists_list > ul").prepend($new_item);
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
      return $("#playlists_list > ul").prepend($new_item);
    });
    $("#close_me").click(function(e) {
      e.stop();
      $("#playlists_popup").hide();
      return false;
    });
    snd.initialize_soundcloud();
    SC.whenStreamingReady(function() {});
    snd.getTracks();
    snd.printExistingPlaylists();
    return snd.setHandlersForActivePlaylist();
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
