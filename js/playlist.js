(function() {

  (function(window, document) {
    var Playlist, Playlists, db, snd;
    snd = window.SOUNDTEST = window.SOUNDTEST || {};
    db = snd.db;
    if (snd.Playlists === void 0) {
      Playlists = function(db_prefix) {
        if (this instanceof Playlists === false) return new Playlists(db_prefix);
        this.db_prefix = db_prefix;
        this.playlists_list = db.get(this.db_prefix + "playlists");
        if (this.playlists_list === false) this.playlists_list = [];
        this.length = this.playlists_list.length;
        return this;
      };
      Playlists.prototype = {
        get: function(id) {
          return this.playlists_list[id];
        },
        create: function(params) {
          var new_playlist;
          params.id = this.length;
          params.active = true;
          params.songs_list = params.songs_list || [];
          new_playlist = new Playlist(params);
          this.playlists_list.push(new_playlist);
          this.length = this.playlists_list.length;
          db.set(this.db_prefix + "playlists", this.playlists_list);
          return new_playlist;
        },
        remove: function(id) {
          this.playlists_list[id].active = false;
          db.set(this.db_prefix + "playlists", this.playlists_list);
          return true;
        },
        update: function(playlist) {
          var item_to_update;
          if ((item_to_update = this.playlists_list[playlist.id])) {
            item_to_update.title = playlist.title;
            item_to_update.description = playlist.description;
            db.set(this.db_prefix + "playlists", this.playlists_list);
          }
        }
      };
      Playlist = function(params) {
        if (this instanceof Playlist === false) return new Playlist(params);
        this.id = params.id;
        this.title = params.title;
        this.description = params.description;
        this.active = params.active;
        this.songs_list = JSON.parse(JSON.stringify(params.songs_list));
        return this;
      };
      snd.Playlists = Playlists;
    }
  })(window, document);

}).call(this);
