snd              = window.SOUNDTEST = window.SOUNDTEST || {}
snd.client_id    = '120a55b8b9d07b69a72faa9f4874f36d'
snd.url          = 'http://api.soundcloud.com/'
snd.redirect_uri = "http://soundcloud.billtrik.gr/callback.html"
snd.hogan        = Hogan
snd.timeoutVar   = null
snd.db           = snd.db || null
snd.db_prefix    = "SND_app_"
snd.my_playlists = snd.Playlists(snd.db_prefix)
snd.current_songs = {}
snd.nowPlaying   =
  obj     : null
  element : null

snd.playlist_song_item_template = snd.hogan.compile '
  <li class="song_item clearfix" data-id="{{id}}">
    <div class="image_div">
      <img src="{{artwork_url}}" />
    </div>
    <div class="details">
      <h5>{{title}}</h5>
      <p class="duration">{{duration}}</p>
      <div class="buttons">
        <button class="remove_me btn btn-danger" data-id="{{id}}">Remove Me</button>
      </div>
    </div>
  </li>'

snd.song_in_playlist = snd.hogan.compile '
  <li class="song_item clearfix" data-id="{{id}}">
    <div class="image_div">
      <img src="{{artwork_url}}" />
    </div>
    <div class="details">
      <h5>{{title}}</h5>
      <p class="current_time">00:00</p><span>/</span>
      <p class="duration">{{duration}}</p>
    </div>
  </li>'

snd.song_item_template = snd.hogan.compile '
  <li class="song_item clearfix" data-id="{{id}}">
    <div class="image_div">
      <img src="{{artwork_url}}" />
    </div>
    <div class="details">
      <h5>{{title}}</h5>
      <p class="current_time">00:00</p><span>/</span>
      <p class="duration">{{duration}}</p>
      <div class="buttons">
        <button class="play_me btn btn-success" data-id="{{id}}">Play</button>
        <button class="playlist_me btn btn-inverse" data-id="{{id}}">PlaylistMe</button>
      </div>
    </div>
  </li>'

snd.playlist_new_template = snd.hogan.compile '
  <li class="playlist_item" data-id="{{playlist_id}}">
    <form class="new_playlist">
      <div class="title_cont">
        <input class="title" name="title" placeholder="Insert Title" value="{{title}}">
      </div>
      <div class="desc_cont">
        <textarea class="desc" name="description" placeholder="Insert Description">{{description}}</textarea>
      </div>
      <div class="buttons">
        <button class="btn btn-small btn-success create" type="submit">{{button_text}}</button>
      </div>
    </form>
  </li>'

snd.playlist_item_template = snd.hogan.compile '
  <li class="playlist_item" data-id="{{id}}">
    <div class="title_cont">
      <p class="title"><span>Title:</span>{{title}}</p>
    </div>
    <div class="desc_cont">
      <p class="desc"><span>Description:</span>{{description}}</p>
    </div>
    
    <div class="buttons">
      <button class="btn btn-small btn-info edit" >Edit It</button>
      <button class="btn btn-small btn-danger delete" >Delete It</button>
      <button class="btn btn-small show_songs" >Show Songs</button>
      <button class="btn btn-small btn-success play_all">Play All</button>
    </div>

    <div class="songs_list">
      <ul class="clearfix"></ul>
    </div>
  </li>'

snd.playlist_popup_template = snd.hogan.compile '
  <li class="playlist_popup_item">
    <button class="btn btn-primary add_here" data-id="{{id}}">{{title}}</button>
  </li>'

snd.setHandlersForExistingPlaylistItem = (element)->
  edit_button       = element.find(".edit")
  delete_button     = element.find(".delete")
  show_songs_button = element.find(".show_songs")
  play_all_buttons  = element.find(".play_all")
  my_id = element.attr("data-id")
  my_playlist = snd.my_playlists.list[my_id]
  my_songs_ul = element.find ".songs_list ul"

  delete_button.on 'click', (e)->
    e.stop()
    
    my_li = $(this).parents("li")
    my_data_id = parseInt my_li.attr("data-id"), 10
    snd.my_playlists.remove my_data_id
    my_li.remove()
    return false

  edit_button.on 'click', (e)->
    e.stop()
    
    my_li = $(this).parents("li")
    my_data_id = parseInt my_li.attr("data-id"), 10
    playlist = snd.my_playlists.get my_data_id
    
    playlist.button_text = "Update It"
    $new_item = $(snd.playlist_new_template.render playlist)
    delete playlist.button_text
    snd.setHandlersForUpdatingPlaylistItem $new_item, playlist

    if (previous = my_li.previous()).length is 0
      $("#playlists_list > ul").prepend $new_item
    else
      previous.after $new_item

    my_li.remove()
    

    return false

  play_all_buttons.on 'click', (e)->
    e.stop()
    target_ul = $("#active_playlist_list ul")
    target_ul.empty()
    for index, song of my_playlist.songs_list
      $new_item = $(snd.song_in_playlist.render song)
      # snd.setHandlersForPLaylistItem $new_item
      target_ul.append $new_item


    $(".span12 .active").removeClass("active")
    $(".navbar .nav .active").removeClass("active")
    $("#active_playlist_list").addClass("active")
    $("#active_playlist_button").parent().addClass("active")
    $("#active_button_play").click()

    return false;

  show_songs_button.on 'click', (e)->
    e.stop()
    
    if element.find(".songs_list").hasClass("active") is false
      my_songs_ul.empty()
      for index, song of my_playlist.songs_list
        $new_item = $(snd.playlist_song_item_template.render song)
        
        $new_item.find(".remove_me").on 'click', (e)->
          e.stop()
          my_song_id = $(this).attr("data-id")
          my_playlist_id = $(this).parents(".playlist_item").attr("data-id")
          snd.my_playlists.list[my_playlist_id].remove_song my_song_id
          $(this).parents(".song_item").remove()
          return false

        snd.setHandlersForExistingPlaylistItem $new_item
        my_songs_ul.append $new_item

    element.find(".songs_list").toggleClass("active")
    return false;

snd.setHandlersForUpdatingPlaylistItem = (element, playlist)->
  create_button = element.find(".create")
  create_button.on 'click', (e)->
    e.stop()
    
    my_li                = $(this).parents("li")
    playlist.title       = my_li.find(".title").val()
    playlist.description = my_li.find(".desc").val()

    snd.my_playlists.update playlist

    $new_item = $(snd.playlist_item_template.render playlist)
    snd.setHandlersForExistingPlaylistItem $new_item

    if (previous = my_li.previous()).length is 0
      $("#playlists_list > ul").prepend $new_item
    else
      previous.after $new_item

    my_li.remove()
    
    return false;

snd.initialize_soundcloud = ->
  SC.initialize
    client_id: snd.client_id
    redirect_uri: snd.redirect_uri
  return
      
snd.getTracks = ->
  SC.get "/tracks", {limit: 12}, (tracks)->
    for track in tracks
      snd.current_songs[track.id] = track
    snd.renderSongs tracks
    return
  return
    
snd.renderSongs = (data)->
  for data_item in data
    data_item.duration = secondsToTime data_item.duration
    # data_item.artwork_url = data_item.artwork_url || "#"
    $new_item = $(snd.song_item_template.render data_item)
    snd.setHandlersForNewMusicItem $new_item
    $("#songs_list ul").append $new_item
  
snd.changeButtonToStop = (element)->
  return if element is undefined
  element.removeClass("btn-success")
  element.addClass("btn-danger")
  element.html("Stop")
  return

snd.changeButtonToPlay = (element)->
  return if element is undefined
  element.parents("li").find(".current_time").html "00:00"
  element.removeClass("btn-danger")
  element.addClass("btn-success")
  element.html("Play")
  return

snd.timeoutfunc = ->
  snd.timeoutVar = setTimeout ->
    if snd.nowPlaying.li
      current_time = secondsToTime snd.nowPlaying.obj.position
      snd.nowPlaying.li.find(".current_time").html current_time
      snd.timeoutfunc()
  , 1000

snd.playItemInPlaylist = (params)->
  SC.whenStreamingReady ->
    soundObj           = SC.stream(params.id)
    snd.nowPlaying.obj = soundObj
    snd.nowPlaying.li  = params.li
    soundObj.play
      onplay: ->
        clearTimeout snd.timeoutVar
        snd.timeoutfunc()
      onpause:->
        console.log "onpause"
      onstop:->
        console.log "onstop"
        clearTimeout snd.timeoutVar
      onerror: ->
        console.log "error"
      onfinish: ->
        snd.nowPlaying.li.find(".current_time").html "00:00"
        params.li.removeClass("nowplaying")
        new_element = snd.nowPlaying.li.next()
        if new_element.length > 0
          new_element.addClass("nowplaying")
          snd.playItemInPlaylist
            id: new_element.attr("data-id")
            li: new_element
        else
          snd.nowPlaying.obj = null
          snd.nowPlaying.li  = null
    return
  return

snd.setHandlersForActivePlaylist = ()->
  $("#active_button_play").on 'click', ->
    active_song = $("#active_playlist_list .song_item.nowplaying")
    return false if active_song.length is 1 and snd.nowPlaying.li
    ##STOP OTHERS THAT ARE PLAYING
    if snd.nowPlaying.li
      if snd.nowPlaying.button and snd.nowPlaying.button.length > 0
        snd.changeButtonToPlay snd.nowPlaying.button
      snd.nowPlaying.obj.stop()

    if active_song.length is 0
      active_song = $("#active_playlist_list .song_item").first()
    return false if active_song.length is 0
    active_song.addClass("nowplaying")

    my_id = active_song.attr("data-id")
    snd.playItemInPlaylist
      id: my_id
      li: active_song

    return

  $("#active_controls .prevnext").on 'click', (e)->
    e.preventDefault()
    ## GET THE ITEM TO PLAY
    my_id = $(this).attr("id")
    active_song = $("#active_playlist_list .song_item.nowplaying")

    if active_song.length is 0
      active_song = $("#active_playlist_list .song_item").first()
      active_song.addClass("nowplaying")
    return false if active_song.length is 0

    if my_id is "active_button_prev" 
      return false if active_song.previous().length is 0
    else
      return false if active_song.next().length is 0

    active_song.find(".current_time").html "00:00"
    active_song.removeClass("nowplaying")
    if my_id is "active_button_prev" 
      active_song = active_song.previous()
    else
      active_song = active_song.next()
    active_song.addClass("nowplaying")

    if snd.nowPlaying.li
      if snd.nowPlaying.button and snd.nowPlaying.button.length > 0
        snd.changeButtonToPlay snd.nowPlaying.button
      snd.nowPlaying.obj.stop()

      my_id = active_song.attr("data-id")
      snd.playItemInPlaylist
        id: my_id
        li: active_song

  $("#active_button_stop").on 'click', ->
    active_song = $("#active_playlist_list .song_item.nowplaying")
    return false if active_song.length is 0

    if snd.nowPlaying.li
      if snd.nowPlaying.button and snd.nowPlaying.button.length > 0
        snd.changeButtonToPlay snd.nowPlaying.button
      snd.nowPlaying.obj.stop()
    
    active_song.find(".current_time").html "00:00"
    active_song.removeClass("nowplaying")
    snd.nowPlaying.obj = null
    snd.nowPlaying.li = null
    snd.nowPlaying.obj = null

  return

snd.setHandlersForNewMusicItem = (item)->
  song_id = item.attr("data-id")
  item.find(".play_me").on 'click', ->
    if snd.nowPlaying.li
      snd.changeButtonToPlay snd.nowPlaying.button
      snd.nowPlaying.obj.stop()
      if snd.nowPlaying.button and snd.nowPlaying.button[0] is this
        snd.nowPlaying.li = null
        snd.nowPlaying.button = null
        snd.nowPlaying.obj = null
        return true

    me    = $(this)
    snd.changeButtonToStop me
    my_id = parseInt me.attr("data-id"), 10
    SC.whenStreamingReady ->
      soundObj               = SC.stream(my_id)
      snd.nowPlaying.obj     = soundObj
      snd.nowPlaying.li      = me.parents("li")
      snd.nowPlaying.button  = me
      soundObj.play
        onplay: ->
          # console.log "onplay"
          snd.timeoutfunc()
        onpause:->
          # console.log "onplay"
        onstop:->
          # console.log "onstop"
          clearTimeout snd.timeoutVar
          snd.changeButtonToPlay snd.nowPlaying.button
        onfinish: ->
          snd.changeButtonToPlay snd.nowPlaying.button
          snd.nowPlaying.li.find(".current_time").html "00:00"
          snd.nowPlaying.li = null
          snd.nowPlaying.button = null
          snd.nowPlaying.obj = null
    return

  item.find(".playlist_me").on 'click',->
    $("#playlists_popup").show("block")
    ul = $("#playlists_popup ul")
    ul.empty()
    for data_item in snd.my_playlists.list
      if data_item.active is true
        $new_item = $(snd.playlist_popup_template.render data_item)
        snd.setHandlersPlaylistPopupItem $new_item, song_id
        ul.append $new_item


  return

snd.setHandlersPlaylistPopupItem = (element, song_id)->
  element.find(".add_here").on 'click', ->
    my_playlist_id = parseInt $(this).attr("data-id"), 10
    my_song_id     = song_id
    snd.my_playlists.list[my_playlist_id].add_song snd.current_songs[my_song_id]
    $("#playlists_popup").hide()

  return

snd.printExistingPlaylists = ->
  for index, playlist of snd.my_playlists.list
    if playlist.active is true
      $new_item = $(snd.playlist_item_template.render playlist)
      snd.setHandlersForExistingPlaylistItem $new_item
      $("#playlists_list > ul").prepend $new_item
  return

snd.setHandlersForNewPlaylistItem = (element)->
  create_button = element.find(".create")
  create_button.on 'click', (e)->
    e.stop()
    
    my_li = $(this).parents("li")
    
    my_title = my_li.find(".title").val()
    my_desc = my_li.find(".desc").val()

  
    new_playlist = snd.my_playlists.create 
      title       : my_title
      description : my_desc
        
    my_li.remove()
    
    $new_item = $(snd.playlist_item_template.render new_playlist)
    snd.setHandlersForExistingPlaylistItem $new_item
    $("#playlists_list > ul").prepend $new_item
    return false;


$.domReady ->
  $(".navbar .btn-navbar").on 'click',->
    $(".navbar").toggleClass("active")

  $(".navbar .nav li a").on 'click', (e)->
    e.stop();

    my_target = $( "#" + $(this).attr("data-target") )

    $(".navbar .nav li.active").removeClass("active")
    $(this).parent().addClass("active")

    $(".content_div.active").removeClass("active")
    my_target.addClass("active")

    $(".navbar").removeClass("active")
    return false

  $("#create_playlist_button").on 'click',->
    $new_item = $(snd.playlist_new_template.render {button_text: "Create It"} )
    snd.setHandlersForNewPlaylistItem $new_item
    $("#playlists_list > ul").prepend $new_item

  $("#close_me").click (e)->
    e.stop()
    $("#playlists_popup").hide()
    return false

  snd.initialize_soundcloud()
  SC.whenStreamingReady ->
    return
  snd.getTracks()
  snd.printExistingPlaylists()
  snd.setHandlersForActivePlaylist()





secondsToTime = (secs)->
  secs = secs / 1000
  hours = Math.floor(secs / (60 * 60))
  hours = "0" + hours if hours < 10

  divisor_for_minutes = secs % (60 * 60)
  minutes = Math.floor(divisor_for_minutes / 60)
  minutes = "0" + minutes if minutes < 10

  divisor_for_seconds = divisor_for_minutes % 60
  seconds = Math.ceil(divisor_for_seconds)
  seconds = "0" + seconds if seconds < 10

  return minutes + ":" + seconds






  # $.ajax
  #   url: snd.url + 'tracks.json' + '?client_id=' + snd.client_id
  #   type: 'jsonp'
  #   jsonpCallback: 'callback'
  #   success: (resp)->
  #     console.log "success:", resp
  #   error: (resp)->
  #     console.log "error:", resp
  #   complete: (resp)->
  #     console.log "complete:", resp


  snd.getUserDetails = ->
  SC.get "/me", (me) ->
    $("#username").text(me.username)
    $("#description").val(me.description)
  # if SC.isConnected()
  #   snd.getUserDetails()
  #   $("#notloggedin").hide()
  #   $("#loggedin").show('block')


  # $("#connect").on "click", ->
  #   SC.connect ->
  #     getUserDetails()