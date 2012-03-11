(function() {

  (function(window, document) {
    var Playlist, Playlists, Song, db, snd;
    snd = window.SOUNDTEST = window.SOUNDTEST || {};
    db = snd.db;
    if (snd.Playlists === void 0) {
      Playlists = function(db_prefix) {
        var item, list, _i, _len;
        if (this instanceof Playlists === false) return new Playlists(db_prefix);
        this.db_prefix = db_prefix;
        this.list = [];
        list = db.get(this.db_prefix + "playlists");
        if (list !== false) {
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            item = list[_i];
            this.list.push(new Playlist(item));
          }
        }
        return this;
      };
      Playlists.prototype = {
        get: function(id) {
          return this.list[id];
        },
        create: function(params) {
          var new_playlist;
          params.id = this.list.length;
          params.active = true;
          params.songs_list = params.songs_list || [];
          new_playlist = new Playlist(params);
          this.list.push(new_playlist);
          db.set(this.db_prefix + "playlists", this.list);
          return new_playlist;
        },
        remove: function(id) {
          this.list[id].active = false;
          db.set(this.db_prefix + "playlists", this.list);
          return true;
        },
        update: function(playlist) {
          var item_to_update;
          if ((item_to_update = this.list[playlist.id])) {
            item_to_update.title = playlist.title;
            item_to_update.description = playlist.description;
            db.set(this.db_prefix + "playlists", this.list);
          }
        }
      };
      Playlist = function(params) {
        var item, _i, _len, _ref;
        if (this instanceof Playlist === false) return new Playlist(params);
        this.id = params.id;
        this.title = params.title;
        this.description = params.description;
        this.active = params.active;
        this.songs_list = [];
        _ref = params.songs_list;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          this.songs_list.push(new Song(item));
        }
        return this;
      };
      Playlist.prototype = {
        add_song: function(song) {
          this.songs_list.push(new Song(song));
          console.log(this.songs_list);
        },
        remove_song: function(song) {}
      };
      Song = function(params) {
        if (this instanceof Song === false) return new Song(params);
        this.id = params.id;
        this.title = params.title;
        this.artwork_url = params.artwork_url;
        this.duration = params.duration;
        return this;
      };
      snd.Playlists = Playlists;
    }
  })(window, document);

}).call(this);
