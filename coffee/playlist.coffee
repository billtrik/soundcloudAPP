((window, document)->
  snd = window.SOUNDTEST = window.SOUNDTEST || {};
  db = snd.db

  if snd.Playlists is undefined
    Playlists = (db_prefix)->
      if this instanceof Playlists is false
        return new Playlists(db_prefix)

      @db_prefix      = db_prefix
      @list = []
      list = db.get @db_prefix + "playlists"
      if list isnt false
        for item in list
          @list.push new Playlist(item)
      return this

    Playlists:: = 
      get: (id)->
        return @list[id]

      create: (params)->
        params.id         = @list.length
        params.active     = true
        params.songs_list = params.songs_list || []
        new_playlist      = new Playlist params

        @list.push new_playlist
        db.set @db_prefix + "playlists", @list
        
        return new_playlist

      remove: (id)->
        @list[id].active = false
        db.set @db_prefix + "playlists", @list
        return true

      update: (playlist)->
        if (item_to_update = @list[playlist.id])
          item_to_update.title       = playlist.title
          item_to_update.description = playlist.description
          db.set @db_prefix + "playlists", @list
        return


    Playlist = (params)->
      if this instanceof Playlist is false
        return new Playlist(params)

      @id          = params.id
      @title       = params.title
      @description = params.description
      @active      = params.active
      @songs_list  = []
      for item in params.songs_list
        @songs_list.push new Song(item)

      return this

    Playlist:: =
      add_song: (song)->
        @songs_list.push new Song(song)
        console.log @songs_list
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