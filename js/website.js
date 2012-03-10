(function() {
  var secondsToTime, snd;

  snd = window.SOUNDTEST = window.SOUNDTEST || {};

  snd.client_id = '120a55b8b9d07b69a72faa9f4874f36d';

  snd.url = 'http://api.soundcloud.com/';

  snd.redirect_uri = "http://soundcloud.billtrik.gr/callback.html";

  snd.hogan = Hogan;

  snd.nowPlaying = {
    obj: null,
    element: null
  };

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

  snd.template = snd.hogan.compile('\
  <div class="song_item clearfix">\
    <div class="image_div">\
      <img src="{{artwork_url}}" />\
    </div>\
    <div class="details">\
      <h5>{{title}}</h5>\
      <p class="genre">{{genre}}</p>\
      <p class="duration">{{duration}}</p>\
      <button class="play_me btn-info" data-id="{{id}}">Play</button>\
    </div>\
  </div>');

  snd.renderSongs = function(data) {
    var $new_item, data_item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      data_item = data[_i];
      data_item.duration = secondsToTime(data_item.duration);
      $new_item = $(snd.template.render(data_item));
      snd.setHandlersFor($new_item);
      _results.push($("#songs_list").append($new_item));
    }
    return _results;
  };

  snd.changeButtonToPause = function(element) {
    element.removeClass("btn-info");
    element.addClass("btn-warning");
    element.html("Pause");
  };

  snd.changeButtonToPlay = function(element) {
    element.removeClass("btn-warning");
    element.addClass("btn-info");
    element.html("Play");
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
      snd.changeButtonToPause(me);
      my_id = parseInt(me.attr("data-id"), 10);
      SC.whenStreamingReady(function() {
        var soundObj;
        soundObj = SC.stream(my_id);
        snd.nowPlaying.obj = soundObj;
        snd.nowPlaying.element = me;
        return soundObj.play();
      });
    });
  };

  $.domReady(function() {
    snd.initialize_soundcloud();
    return snd.getTracks();
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
