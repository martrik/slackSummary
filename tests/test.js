const utils = require('../utils.js');

utils.handleRequest({ channel_name: "deployment" }, function(err, res) {
    console.log(res);
});
