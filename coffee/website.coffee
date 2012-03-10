snd              = window.SOUNDTEST = window.SOUNDTEST || {}
snd.client_id    = '120a55b8b9d07b69a72faa9f4874f36d'
snd.url          = 'http://api.soundcloud.com/'
snd.redirect_uri = "http://soundcloud.billtrik.gr/callback.html"
snd.hogan        = Hogan
snd.timeoutVar   = null
snd.db           = snd.db || null
snd.db_prefix    = "SND_app_"
snd.playlists    = []
snd.nowPlaying   =
  obj     : null
  element : null

snd.song_item_template = snd.hogan.compile '
  <li class="song_item clearfix">
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
        <button class="btn btn-success create" type="submit">Create It</button>
      </div>
    </form>
  </li>'

snd.playlist_item_template = snd.hogan.compile '
  <li class="playlist_item" data-id="{{id}}">
    <div class="title_cont">
      <p class="title">{{title}}</p>
    </div>
    <div class="desc_cont">
      <p class="desc">{{description}}</p>
    </div>
    
    <div class="buttons">
      <button class="btn btn-info edit" type="submit">Edit It</button>
      <button class="btn btn-danger delete" type="submit">Delete It</button>
    </div>
  </li>'

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

snd.initialize_soundcloud = ->
  SC.initialize
    client_id: snd.client_id
    redirect_uri: snd.redirect_uri
  return
      
snd.getTracks = ->
  SC.get "/tracks", {limit: 12}, (tracks)->
    snd.renderSongs tracks
    
snd.renderSongs = (data)->
  for data_item in data
    data_item.duration = secondsToTime data_item.duration
    # data_item.artwork_url = data_item.artwork_url || "#"
    $new_item = $(snd.song_item_template.render data_item)
    snd.setHandlersFor $new_item
    $("#songs_list ul").append $new_item
  
snd.changeButtonToStop = (element)->
  element.removeClass("btn-success")
  element.addClass("btn-danger")
  element.html("Stop")
  return

snd.changeButtonToPlay = (element)->
  element.parents("li").find(".current_time").html "00:00"
  element.removeClass("btn-danger")
  element.addClass("btn-success")
  element.html("Play")
  return

snd.timeoutfunc = ->
  snd.timeoutVar = setTimeout ->
    if snd.nowPlaying.element
      current_time = secondsToTime snd.nowPlaying.obj.position
      snd.nowPlaying.element.parents("li").find(".current_time").html current_time
      snd.timeoutfunc()
  , 1000

snd.setHandlersFor = (item)->
  item.find(".play_me").on 'click', ->
    if snd.nowPlaying.element
      snd.changeButtonToPlay snd.nowPlaying.element
      snd.nowPlaying.obj.stop()
      if snd.nowPlaying.element[0] is this
        snd.nowPlaying.element = null
        return true

    me    = $(this)
    snd.changeButtonToStop me
    my_id = parseInt me.attr("data-id"), 10
    SC.whenStreamingReady ->
      soundObj               = SC.stream(my_id)
      snd.nowPlaying.obj     = soundObj
      snd.nowPlaying.element = me
      soundObj.play
        onplay: ->
          # console.log "onplay"
          snd.timeoutfunc()
        onpause:->
          # console.log "onplay"
        onstop:->
          # console.log "onstop"
          clearTimeout snd.timeoutVar
          snd.changeButtonToPlay snd.nowPlaying.element
        onfinish: ->
          snd.changeButtonToPlay snd.nowPlaying.element
          snd.nowPlaying.element.parents("li").find(".current_time").html "00:00"
          snd.nowPlaying.element = null
    return

  return

snd.getPlaylists = ->
 if snd.db
  snd.playlists = snd.db.get snd.db_prefix + "playlists" || []
  snd.playlists = [] if snd.playlists is false
  for index, playlist of snd.playlists
    playlist.id = index
    $new_item = $(snd.playlist_item_template.render playlist)
    snd.handlersForNewPlaylist $new_item
    $("#playlists_list ol").prepend $new_item
  return

snd.createPlaylist = ->
  new snd.Playlist
    db_prefix: snd.db_prefix

snd.editPlaylist = ->

  return

snd.handlersForNewPlaylist = (element)->
  create_button = element.find(".create")
  create_button.on 'click', (e)->
    e.stop()
    
    my_li = $(this).parents("li")
    
    my_title = my_li.find(".title").val()
    my_desc = my_li.find(".desc").val()

    new_playlist = snd.createPlaylist()
    my_id = new_playlist.save 
      title       : my_title
      description : my_desc
    my_li.remove()
    
    playlist_data = 
      id          : my_id
      title       : my_title
      description : my_desc

    $new_item = $(snd.playlist_item_template.render playlist_data)
    snd.handlersForNewPlaylist $new_item
    $("#playlists_list ol").prepend $new_item
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
    $new_item = $(snd.playlist_new_template.render {})
    snd.handlersForNewPlaylist $new_item
    $("#playlists_list ol").prepend $new_item

  snd.initialize_soundcloud()
  snd.getTracks()
  snd.getPlaylists()





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