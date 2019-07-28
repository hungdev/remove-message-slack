var https = require('https');
var cors = require("cors");
const bodyParser = require('body-parser');
require('dotenv').config()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CONFIGURATION #######################################################################################################

// https://api.slack.com/custom-integrations/legacy-tokens
var token = process.env.TOKEN;
// https://app.slack.com/client/TLU6UGZ7S/CLW2R0DU7
var channel = process.env.CHANNEL;
var privateChannel = false;
var delay = 300; // delay between delete operations in millisecond

// GLOBALS #############################################################################################################

var channelApi = privateChannel ? 'groups' : 'channels';
var baseApiUrl = 'https://slack.com/api/';
var historyApiUrl = baseApiUrl + channelApi + '.history?token=' + token + '&count=1000&channel=' + channel;
var deleteApiUrl = baseApiUrl + 'chat.delete?token=' + token + '&channel=' + channel + '&ts='
var messages = [];

// ---------------------------------------------------------------------------------------------------------------------
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

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

app.get('/', (req, res) => res.send('Hello Cee!'))

app.get('/rm', async (req, res) => {
  await https.get(historyApiUrl, function (res) {

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
  res.end("Remove Okey")
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))