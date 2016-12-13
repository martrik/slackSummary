var Botkit = require('botkit');
var request = require('request');

var controller = Botkit.slackbot({
  debug: false
  //include "log: false" to disable logging
  //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
});

var harassment_keywords = ['^.*\\bfuck you\\b.*$', '^.*\\barse\\b.*$', '^.*\\barsehole\\b.*$', '^.*\\basshole\\b.*$',
                          '^.*\\bbastard\\b.*$', '^.*\\bbell\\b.*$', '^.*\\bbellend\\b.*$', '^.*\\bberk\\b.*$',
                          '^.*\\bbint\\b.*$', '^.*\\bblimey\\b.*$', '^.*\\bblighter\\b.*$', '^.*\\bbloody\\b.*$',
                          '^.*\\bblooming\\b.*$', '^.*\\bbollocks\\b.*$', '^.*\\bbugger\\b.*$', '^.*\\bcad\\b.*$',
                          '^.*\\bcac\\b.*$', '^.*\\bchav\\b.*$', '^.*\\bmalparido\\b.*$'];

// connect the bot to a stream of messages
controller.spawn({
  token: 'xoxb-115867302694-qIeAeKdU1MfehnpQWfGvKoad',
}).startRTM()

// welcome message
controller.hears(['^.*\\bhello\\b.*$', '^.*\\bhi\\b.*$', '^.*\\bhey\\b.*$'],['direct_message','direct_mention','mention'],function(bot, message) {
  bot.api.users.info({user: message.user}, function(err, info){
      if (info.ok) {
          bot.reply(message, 'Hello ' + info.user.profile.first_name + '!!');
      } else {
          bot.reply(message, 'Hello.');
      }
  });
});

// summary message channels
controller.hears(['^.*\\bsummarize\\b.*$', '^.*\\bcatchup\\b.*$', '^.*\\bsummarise\\b.*$'] ,['direct_mention','mention'] ,function(bot, message) {
  get_summary_and_post(bot, message, message.channel);
});

controller.hears(['^summarize$', '^catchup$', '^summarise$'], ['direct_message'], function(bot, message){
  bot.reply(message, 'ERROR: You should ask for a concrete channel.');
});

controller.hears(['^summarize[^<]*(<#([^|]*)\\|([^>]*)>)[^$]*$', '^catchup[^<]*(<#([^|]*)\\|([^>]*)>)[^$]*$',
                  '^summarise[^<]*(<#([^|]*)\\|([^>]*)>)[^$]*$'], ['direct_message'], function(bot, message){
  var channel_id = message.match[2];
  get_summary_and_post(bot, message, channel_id)
});

// controlling hack harassment
controller.hears(harassment_keywords,['ambient'],function(bot, message) {
  bot.reply(message,'This seems to be harassment. Making this visible to <!channel> and reporting to the team admins.');

  // send personal message to admins
  bot.api.users.list({}, function(err, info){
      if(info.ok){
        for(var i = 0; i < info.members.length; i++){
          var m = info.members[i];
          if(!m.is_bot && m.is_admin){
            bot.api.im.open({'user': m.id}, function(err1, info){
              if(info.ok){
                var message_to_admin = {
                  "channel": info.channel.id,
                  "text": 'You should check <#'+message.channel+'|>. There might be harassing going on.',
                  "as_user": true
                }
                bot.api.chat.postMessage(message_to_admin, function(err2, info){});
              }
            });
          }
        }
      }else{
        bot.reply(message, 'ERROR: users.list');
      }
  });
});

function get_summary_and_post(bot, message, channel){
  //bot.reply(message, 'Summarizing ' + channel + ' on the last 24h');
  request.post({url:'https://2z24ldv9og.execute-api.eu-west-1.amazonaws.com/prod/slackSummary', body: 'channel_id='+channel+'&token=lMrImvMKRAReyZwXbKyMvvdt&user_id='+message.user}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var json = JSON.parse(body);
      var summary_message = {};
      summary_message['channel'] = message.channel;
      summary_message['text'] = json.text;
      summary_message['attachments'] = json.attachments;
      summary_message['as_user'] = true;
      bot.api.chat.postMessage(summary_message, function(err2, info){});
    }else{
      bot.reply(message, "An error has occurred requesting your summary. ERROR: "+response.statusCode);
    }
  })
}
