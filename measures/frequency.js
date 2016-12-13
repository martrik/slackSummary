const focusInterval = 120; // seconds
const freqFactor    = 3.2;

var unTrackedMsgs = [];
var initialised   = false;

exports.isEnough = function isEnough(message, history) {
  // Used for calculations as well as the unique identifier
  // of each message.
  var messageTs = cleanTS(message.ts);

  // Initialise, calulate the average frequency
  if (!initialised) {
    for (var ts in history) {
      unTrackedMsgs.push(ts);
    }
    initialised = true;
  }

  var averageFreq   = 0.0001;
  //if (averageFreq === 0) {
    var totalTime = 0;
    var lastTs    = 0;
    var messages  = 0;
    for (var ts in history) {
      if (ts < messageTs) {
        if (lastTs == 0) lastTs = ts;
        totalTime += (lastTs - ts);
        lastTs = ts;

        messages += 1
      }
    }
    averageFreq = messages / totalTime;
  //}



  // Check only if the message is important
  if (contains(unTrackedMsgs, messageTs)) {
    // Look at the next (focusInterval) seconds into the
    // conversation.
    var periodMessages = [];

    var finalTime = 0;
    for (var ts in history) {
      if (ts - messageTs < focusInterval && ts - messageTs > 0) {
        periodMessages.push(ts);
        finalTime = ts;
      }
    }
    var periodFreq = periodMessages.length / (finalTime - messageTs);

    console.log(message.text + " " + averageFreq + " " + periodFreq);

    // Make decision about its importance and if it is, forget
    // about all the messages used to make such decision.
    if (isConsiderablyBigger(periodFreq, averageFreq)) {
      for (var i = 0; i < periodMessages.length; i++) {
        remove(unTrackedMsgs, periodMessages[i]);
      }
      return 1;
    }
    return 0;
  }
  return 0;
}

function cleanTS(ts) {
  return ts;
}

function isConsiderablyBigger(freqA, freqB) {
  return freqA > (freqB * freqFactor);
}

function contains(a, obj) {
  var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function remove(a, obj) {
  var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           a.splice(i, 1);
       }
    }
}
