const reactFactor = 2;

exports.areConsiderable = function areConsiderable(message, averageReact) {
  const reactions = message.reactions;

  if (reactions && reactions.length >= averageReact * reactFactor) {
    return 1;
  }
  return 0;
}
