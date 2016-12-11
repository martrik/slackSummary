const Slack = require('slack-node');
const frequency = require('./frequency.js');
const color = require('./color.js');

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

function importance(message, stats) {
  const reactions = message.reactions;

  var l = message.text.length >= stats.averageLen * 2 ? 1 : 0;
  var r = reactions && reactions.length >= stats.averageReact * 2 ? 1 : 0;
  var n = message.text.match('^.*<!(everyone|channel)>.*$') !== null ? 1 : 0;
  var f = frequency.isEnough(message, stats.history) ? 1 : 0;
  var m = message.text.match('^.*<@('+userId+').*>.*$') !== null ? 1 : 0;

  return l + r + n + f + m;
}

function parseMessages(messages, stats) {
  var parsed = [];

  while (messages.length > 0 && parsed.length < catchUpMax) {
    var message = messages.pop();
    var importanceVal = importance(message, stats);

    if (message["type"] == "message" && importanceVal > 0) {
      parsed.push({
        "fallback": message["text"],
        "color": color.messageColor(importanceVal),
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

    const rawMessages = response.messages;
    const stats = analizeMessages(rawMessages);
    const messages = parseMessages(rawMessages, stats);

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
