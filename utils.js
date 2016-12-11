const Slack = require('slack-node');
var apiToken;
var slack;

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
      //messages[count]["username"] = response.user.profile.name;
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

  return l || r || n;
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
  const freqHistory = {};
  const length = messages.length;

  for (var i = 0; i < messages.length; i++) {
    var message = messages[i];
    if (message.type == "message") {
      averageReactions += (message.reactions ? message.reactions.length : 0) / length;
      averageLength += message.text.length / length;
      freqHistory[message.ts] = freqHistory[message.ts] ? freqHistory[message.ts] + 1 : i;
    }
  }

  console.log(freqHistory);

  return { averageReact: averageReactions, averageLen: averageLength };
}

function getMessages(channel, callback) {
  console.log('Getting messages from', channel);
  slack.api('channels.history', {
    channel: channel
  }, function(err, response) {
    if (err) {
      callback(err, null);
    }

    const rawMessages = response.messages;
    const stats = analizeMessages(rawMessages);
    const messages = parseMessages(rawMessages, stats);

    //console.log(messages);

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
      apiToken = 'xoxp-2535407483-2535407485-115893520855-a01018264ac2d5bd44ff4b2a764143e5';
      slack = new Slack(apiToken);
      getMessages(params.channel_id, callback);

      // const command = params.command;
      // const channel = params.channel_name;
      // const commandText = params.text;
}