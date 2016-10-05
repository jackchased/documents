// $ npm install smartobject --save
// $ npm install mqtt-node --save
// write some code
// $ node client.js

var SmartObject = require('smartobject');
var so = new SmartObject();

// https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_temperature
so.init('temperature', 0, {
    sensorValue: 26,
    units: 'Cel'
});

setInterval(function () {
    var randomTemp = 18 + Math.floor(Math.random() * 100)/10;

    so.write('temperature', 0, 'sensorValue', randomTemp, function (err, data) {
        if (!err)
            console.log('Temperature value is updated to: ' + data + ' Cel');
    });
}, 1000);

