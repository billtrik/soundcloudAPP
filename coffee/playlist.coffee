((window, document)->
  snd = window.SOUNDTEST = window.SOUNDTEST || {};
  db = snd.db

  if snd.Playlists is undefined
    Playlists = (db_prefix)->
      if this instanceof Playlists is false
        return new Playlists(db_prefix)

      @db_prefix      = db_prefix
      @playlists_list = db.get @db_prefix + "playlists"
      @playlists_list = [] if @playlists_list is false
      @length = @playlists_list.length
      return this

    Playlists:: = 
      get: (id)->
        return @playlists_list[id]

      create: (params)->
        params.id         = @length
        params.active     = true
        params.songs_list = params.songs_list || []
        new_playlist      = new Playlist params

        @playlists_list.push new_playlist
        @length = @playlists_list.length
        db.set @db_prefix + "playlists", @playlists_list
        
        return new_playlist

      remove: (id)->
        @playlists_list[id].active = false
        db.set @db_prefix + "playlists", @playlists_list
        return true

      update: (playlist)->
        if (item_to_update = @playlists_list[playlist.id])
          item_to_update.title       = playlist.title
          item_to_update.description = playlist.description
          db.set @db_prefix + "playlists", @playlists_list
        return


    Playlist = (params)->
      if this instanceof Playlist is false
        return new Playlist(params)

      @id          = params.id
      @title       = params.title
      @description = params.description
      @active      = params.active
      @songs_list  = JSON.parse( JSON.stringify( params.songs_list ))

      return this

    

    snd.Playlists = Playlists

  return
)(window,document )