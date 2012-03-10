(function() {
  var snd;

  snd = window.SOUNDTEST = window.SOUNDTEST || {};

  snd.client_id = '120a55b8b9d07b69a72faa9f4874f36d';

  snd.url = 'http://api.soundcloud.com/';

  snd.redirect_uri = "http://dl.dropbox.com/u/215509/sound/callback.html";

  $.domReady(function() {
    var getUserDetails;
    SC.initialize({
      client_id: snd.client_id,
      redirect_uri: snd.redirect_uri
    });
    getUserDetails = function() {
      return SC.get("/me", function(me) {
        $("#username").text(me.username);
        return $("#description").val(me.description);
      });
    };
    if (SC.isConnected()) {
      getUserDetails();
      $("#notloggedin").hide();
      $("#loggedin").show('block');
    }
    return $("#connect").on("click", function() {
      return SC.connect(function() {
        return getUserDetails();
      });
    });
  });

}).call(this);
