((window, document)->
  snd = window.SOUNDTEST = window.SOUNDTEST || {};
  db = snd.db

  if snd.Playlist is undefined
    Playlist = (params)->
      if this instanceof Playlist is false
        return new Playlist(params)

      params       = params || {}
      @db_prefix   = params.db_prefix
      @title       = ""
      @description = ""
      @songs_list  = []

      if params.playlist_id
        @init(params.playlist_id)
      return

    Playlist:: =
      init: (id)->
        playlists = Playlist.get_all_playlists()
        if playlists[id]
          result = Object.create playlists[id] 
        else
          result = {}
        playlists = null
        delete playlists
        return result

      save: (params)->
        playlists = Playlist.get_all_playlists @db_prefix
        playlists = [] if playlists is false
        length = playlists.length + 1
        playlists.push 
          title: params.title
          description: params.description 
        
        db.set @db_prefix + "playlists", playlists
        
        playlists = null
        delete playlists

        return length

      edit: (params)->

        return
      delete: (params)->

        return
      add_song: (params)->
        return
      remove_song: (params)->
        return


    Playlist.get_all_playlists = (prefix)->
      return db.get prefix + "playlists"


    snd.Playlist = Playlist
  
  return
)(window,document )