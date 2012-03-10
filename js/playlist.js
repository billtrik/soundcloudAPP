(function() {

  (function(window, document) {
    var Playlist, db, snd;
    snd = window.SOUNDTEST = window.SOUNDTEST || {};
    db = snd.db;
    if (snd.Playlist === void 0) {
      Playlist = function(params) {
        if (this instanceof Playlist === false) return new Playlist(params);
        params = params || {};
        this.db_prefix = params.db_prefix;
        this.title = "";
        this.description = "";
        this.songs_list = [];
        if (params.playlist_id) this.init(params.playlist_id);
      };
      Playlist.prototype = {
        init: function(id) {
          var playlists, result;
          playlists = Playlist.get_all_playlists();
          if (playlists[id]) {
            result = Object.create(playlists[id]);
          } else {
            result = {};
          }
          playlists = null;
          delete playlists;
          return result;
        },
        save: function(params) {
          var length, playlists;
          console.log("got save");
          console.log(params);
          playlists = Playlist.get_all_playlists(this.db_prefix);
          if (playlists === false) playlists = [];
          length = playlists.length + 1;
          playlists.push({
            title: params.title,
            description: params.description
          });
          db.set(this.db_prefix + "playlists", playlists);
          playlists = null;
          delete playlists;
          return length;
        },
        edit: function(params) {},
        "delete": function(params) {},
        add_song: function(params) {},
        remove_song: function(params) {}
      };
      Playlist.get_all_playlists = function(prefix) {
        return db.get(prefix + "playlists");
      };
      snd.Playlist = Playlist;
    }
  })(window, document);

}).call(this);
