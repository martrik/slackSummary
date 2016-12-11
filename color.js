exports.isEnough = function messageColor(importance) {
  switch (importance) {
    case 1:
      return "#a0d080";
      break;
    case 2:
      return "#80b060";
      break;
    case 3:
      return "#609040";
      break;
    case 4:
      return "#407020";
      break;
    case 5:
      return "#203000";
      break;
    default:
      return "#609040";
  }
}
