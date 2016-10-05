// $ npm init
// $ npm install mqtt-shepherd --save
// wrtie some code in server.js
// $ node server

var MShepherd = require('mqtt-shepherd');
var qserver = new MShepherd('simple_iot_server');

qserver.on('ready', function () {
    console.log('Server is ready. Allow devices to join the network within 180 secs.');
    console.log('Waiting for incoming clients or messages...');
    qserver.permitJoin(180);
});

qserver.start(function (err) {
    if (err)
        console.log(err);
});

