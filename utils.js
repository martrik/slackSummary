const Slack = require('slack-node');
const frequency = require('./frequency.js');

var apiToken;
var slack;
var userId;

const catchUpMax = 20;

function getUserImages(messages, count, callback) {
  if (count === messages.length) {
    callback(messages);
    return;
  }

  slack.api('users.info', {
    token: apiToken,
    user: messages[count].author_name
  }, function(err, response) {
    if (!err && response.ok === true) {
      messages[count]["author_name"] = response.user.profile.real_name;
      messages[count]["author_icon"] = response.user.profile.image_72;
    }

    getUserImages(messages, ++count, callback);

  });
}

function isImportant(message, stats) {
  const reactions = message.reactions;

  var l = message.text.length >= stats.averageLen;
  var r = reactions && reactions.length >= stats.averageReact;
  var n = message.text.match('^.*<!(everyone|channel)>.*$') !== null;
  var f = frequency.isEnough(message, stats.history);

<<<<<<< HEAD
  return l || r || n || f;
=======
  var m = message.text.match('^.*<@('+userId+').*>.*$') !== null;
  console.log(userId);
  console.log(message)

  return l || r || n || m;
>>>>>>> 4db92ba8ef64f568726c7716eebd0ce26ad3f897
}

function parseMessages(messages, stats) {
  var parsed = [];

  while (messages.length > 0 && parsed.length < catchUpMax) {
    var message = messages.pop();

    if (message["type"] == "message" && isImportant(message, stats)) {
      parsed.push({
        "fallback": message["text"],
        "color": "#36a64f",
        "author_name": message["user"],
        "author_icon": "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcT3U6TbpVZPjBgA4aUNjtFXbw1f5kL2S_vsM7Xhlzi62PcAQiRXRjw-CBc",
        "text": message["text"],
        "fields": [{
          "title": message.reactions ? message.reactions.length + " reactions" : ""
        }],
        "ts": message["ts"]
      });
    }
  }

  return parsed;
}

function analizeMessages(messages) {
  var averageReactions = 0;
  var averageLength = 0;
  const msgHistory = {};
  const length = messages.length;

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    if (message.type == "message") {
      averageReactions += (message.reactions ? message.reactions.length : 0) / length;
      averageLength += message.text.length / length;
      msgHistory[message.ts] = i;
    }
  }

  return { averageReact: averageReactions,
           averageLen:   averageLength,
           history:      msgHistory  };
}

function getMessages(channel, callback) {
  //console.log('Getting messages from', channel);
  slack.api('channels.history', {
    channel: channel
  }, function(err, response) {
    if (err) {
      callback(err, null);
    }

<<<<<<< HEAD
    //console.log(response);

=======
>>>>>>> 4db92ba8ef64f568726c7716eebd0ce26ad3f897
    const rawMessages = response.messages;
    const stats = analizeMessages(rawMessages);
    const messages = parseMessages(rawMessages, stats);

    console.log(messages);

    getUserImages(messages, 0, function(messagesPic) {
      const message = {
        "response_type": "ephemeral",
        "text": "Here you have a summary:",
        "attachments": messages
      };

      callback(null, message);
    });
  });
}

exports.handleRequest = function(params, callback) {
      apiToken = 'xoxp-2535407483-2535407485-115961733031-bb118c141ce2b30a4b9104a8755a5064';
      console.log(params);
      userId = params.user_id;
      slack = new Slack(apiToken);
      getMessages(params.channel_id, callback);

      // const command = params.command;
      // const channel = params.channel_name;
      // const commandText = params.text;
}
