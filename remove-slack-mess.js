var https = require('https');

// CONFIGURATION #######################################################################################################

// https://api.slack.com/custom-integrations/legacy-tokens
var token = 'xoxp-708232577264-710093011991-707768378884-41e6ff00eba42d50124c114556c6df21';
// https://app.slack.com/client/TLU6UGZ7S/CLW2R0DU7
var channel = 'CLW2R0DU7';
var privateChannel = false;
var delay = 300; // delay between delete operations in millisecond

// GLOBALS #############################################################################################################

var channelApi = privateChannel ? 'groups' : 'channels';
var baseApiUrl = 'https://slack.com/api/';
var historyApiUrl = baseApiUrl + channelApi + '.history?token=' + token + '&count=1000&channel=' + channel;
var deleteApiUrl = baseApiUrl + 'chat.delete?token=' + token + '&channel=' + channel + '&ts='
var messages = [];

// ---------------------------------------------------------------------------------------------------------------------

function deleteMessage() {
  if (messages.length == 0) {
    return;
  }

  var ts = messages.shift();

  https.get(deleteApiUrl + ts, function (res) {

    var body = '';

    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function () {
      var response = JSON.parse(body);

      if (response.ok === true) {
        console.log(ts + ' deleted!');
      } else if (response.ok === false) {
        messages.push(ts);
      }

      setTimeout(deleteMessage, delay);
    });
  }).on('error', function (e) {
    console.log("Got an error: ", e);
  });
}

// ---------------------------------------------------------------------------------------------------------------------

https.get(historyApiUrl, function (res) {

  var body = '';

  res.on('data', function (chunk) {
    body += chunk;
  });

  res.on('end', function () {

    var response = JSON.parse(body);
    for (var i = 0; i < response.messages.length; i++) {
      messages.push(response.messages[i].ts);
    }
    deleteMessage();
  });
}).on('error', function (e) {
  console.log("Got an error: ", e);
});