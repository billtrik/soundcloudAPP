(function() {

  (function(window, document) {
    var Playlist, Playlists, Song, db, snd;
    snd = window.SOUNDTEST = window.SOUNDTEST || {};
    db = snd.db;
    if (snd.Playlists === void 0) {
      Playlists = function(db_prefix) {
        var id, item, _i, _len, _ref;
        if (this instanceof Playlists === false) return new Playlists(db_prefix);
        this.db_prefix = db_prefix;
        this.list = [];
        this.playlists_ids = db.get(this.db_prefix + "playlist_ids");
        if (this.playlists_ids !== false) {
          _ref = this.playlists_ids;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            id = _ref[_i];
            item = db.get(this.db_prefix + "playlist_" + id);
            item.db_prefix = this.db_prefix;
            this.list.push(new Playlist(item));
          }
        } else {
          this.playlists_ids = [];
        }
        return this;
      };
      Playlists.prototype = {
        get: function(id) {
          return this.list[id];
        },
        create: function(params) {
          var my_id, new_playlist;
          my_id = this.list.length;
          params.id = my_id;
          params.active = true;
          params.songs_list = params.songs_list || [];
          params.db_prefix = this.db_prefix;
          new_playlist = new Playlist(params);
          this.playlists_ids.push(my_id);
          db.set(this.db_prefix + "playlist_ids", this.playlists_ids);
          this.list.push(new_playlist);
          db.set(this.db_prefix + "playlist_" + my_id, new_playlist);
          return new_playlist;
        },
        remove: function(id) {
          this.list[id].active = false;
          db.set(this.db_prefix + "playlist_" + id, this.list[id]);
          return true;
        },
        update: function(playlist) {
          var id, item_to_update;
          id = playlist.id;
          if ((item_to_update = this.list[id])) {
            item_to_update.title = playlist.title;
            item_to_update.description = playlist.description;
            db.set(this.db_prefix + "playlist_" + id, this.list[id]);
          }
        }
      };
      Playlist = function(params) {
        var item, _i, _len, _ref;
        if (this instanceof Playlist === false) return new Playlist(params);
        this.db_prefix = params.db_prefix;
        this.id = params.id;
        this.title = params.title;
        this.description = params.description;
        this.active = params.active;
        this.songs_list = {};
        params.songs_list = params.songs_list || [];
        _ref = params.songs_list;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          this.songs_list[item.id] = new Song(item);
        }
        return this;
      };
      Playlist.prototype = {
        add_song: function(song) {
          this.songs_list[song.id] = new Song(song);
          db.set(this.db_prefix + "playlist_" + this.id, this);
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
