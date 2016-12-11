const lengthFactor = 2;

exports.isConsiderable = function isConsiderable(message, averageLen) {
  if (message.text.length >= averageLen * lengthFactor) {
    return 1;
  }
  return 0;
}
