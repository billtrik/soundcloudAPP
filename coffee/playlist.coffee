((window, document)->
  snd = window.SOUNDTEST = window.SOUNDTEST || {};
  db = snd.db

  if snd.Playlists is undefined
    Playlists = (db_prefix)->
      if this instanceof Playlists is false
        return new Playlists(db_prefix)

      @db_prefix     = db_prefix
      @list          = []
      @playlists_ids = db.get @db_prefix + "playlist_ids"
      if @playlists_ids isnt false
        for id in @playlists_ids
          item = db.get @db_prefix + "playlist_" + id
          item.db_prefix   = @db_prefix
          @list.push new Playlist(item)
      else
        @playlists_ids = []
      return this

    Playlists:: = 
      get: (id)->
        return @list[id]

      create: (params)->
        my_id             = @list.length
        params.id         = my_id
        params.active     = true
        params.songs_list = params.songs_list || []
        new_playlist      = new Playlist params

        @playlists_ids.push my_id
        db.set @db_prefix + "playlist_ids", @playlists_ids
        @list.push new_playlist
        db.set @db_prefix + "playlist_" + my_id, new_playlist
        
        return new_playlist

      remove: (id)->
        @list[id].active = false
        db.set @db_prefix + "playlist_" + id, @list[id]
        return true

      update: (playlist)->
        id = playlist.id
        if (item_to_update = @list[id])
          item_to_update.title       = playlist.title
          item_to_update.description = playlist.description
          db.set @db_prefix + "playlist_" + id, @list[id]
        return


    Playlist = (params)->
      if this instanceof Playlist is false
        return new Playlist(params)

      @db_prefix   = params.db_prefix
      @id          = params.id
      @title       = params.title
      @description = params.description
      @active      = params.active
      @songs_list  = []
      params.songs_list = params.songs_list || []
      for item in params.songs_list
        @songs_list.push new Song(item)

      return this

    Playlist:: =
      add_song: (song)->
        @songs_list.push new Song(song)
        db.set @db_prefix + "playlist_" + @id, @
        return 

      remove_song: (song)->
        return
    

    Song = (params)->
      if this instanceof Song is false
        return new Song(params)
      @id = params.id
      @title = params.title
      @artwork_url = params.artwork_url
      @duration = params.duration

      return this

    snd.Playlists = Playlists

  return
)(window,document )