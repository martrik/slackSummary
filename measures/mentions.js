exports.toThemselves = function toThemselves(message, userId) {
  if (message.text.match('^.*<@('+userId+').*>.*$') !== null) {
    return 1;
  }
  return 0;
}

exports.toTheChannel = function toTheChannel(message) {
  if (message.text.match('^.*<!(everyone|channel)>.*$') !== null) {
    return 1;
  }
  return 0;
}
