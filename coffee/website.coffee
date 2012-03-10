snd              = window.SOUNDTEST = window.SOUNDTEST || {}
snd.client_id    = '120a55b8b9d07b69a72faa9f4874f36d'
snd.url          = 'http://api.soundcloud.com/'
snd.redirect_uri = "http://dl.dropbox.com/u/215509/sound/callback.html"

$.domReady ->
  SC.initialize
    client_id: snd.client_id
    redirect_uri: snd.redirect_uri

  getUserDetails = ->
    SC.get "/me", (me) ->
      $("#username").text(me.username)
      $("#description").val(me.description)
      
  if SC.isConnected()
    getUserDetails()
    $("#notloggedin").hide()
    $("#loggedin").show('block')


  $("#connect").on "click", ->
    SC.connect ->
      getUserDetails()


  # $("#update").on "click", ->
  #   SC.put("/me", {user: {description: $("#description").val()}}, (response, error)->
  #     if(error){
  #       alert("Some error occured: " + error.message);
  #     }else{
  #       alert("Profile description updated!");
  #     }
  #   )

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