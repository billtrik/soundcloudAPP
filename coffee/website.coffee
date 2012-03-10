snd              = window.SOUNDTEST = window.SOUNDTEST || {}
snd.client_id    = '120a55b8b9d07b69a72faa9f4874f36d'
snd.url          = 'http://api.soundcloud.com/'
snd.redirect_uri = "http://soundcloud.billtrik.gr/callback.html"
snd.hogan        = Hogan
snd.timeoutVar   = null
snd.nowPlaying   =
  obj     : null
  element : null

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
  SC.get "/tracks", {limit: 10}, (tracks)->
    snd.renderSongs tracks
    
snd.template = snd.hogan.compile '
  <li class="song_item clearfix">
    <div class="image_div">
      {{#artwork_url?}}
        <img src="{{artwork_url}}" />
      {{/artwork_url?}}
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

snd.renderSongs = (data)->
  for data_item in data
    data_item.duration = secondsToTime data_item.duration
    data_item.artwork_url = data_item.artwork_url || "#"
    $new_item = $(snd.template.render data_item)
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
  
$.domReady ->
  snd.initialize_soundcloud()
  snd.getTracks()





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