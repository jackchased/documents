// On Linkit Smart 7688
// $ npm install smartobject --save


var m = require('mraa'),
    SmartObject = require('smartobject');

var so = new SmartObject({
    led: new m.Gpio(44)
}, function () {
    this.hal.led.dir(m.DIR_OUT);
});

// Light Control Smart Object:
//  https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_lightCtrl
so.init('lightCtrl', 0, {
    onOff: {
        read: function (cb) {
            var hal = this.parent.hal,
                ledState = hal.led.read();

            process.nextTick(function () {
                cb(null, ledState);
            });
        },
        write: function (val, cb) {
            var hal = this.parent.hal,
                ledState;

            hal.led.write(val ? 1 : 0);
            process.nextTick(function () {
                cb(null, hal.led.read());
            });
        }
    }
});

// Use so APIs to blink the led
setInterval(function () {
    so.read('lightCtrl', 0, 'onOff', function (err, data) {
        if (err)
            return console.log(err);

        so.write('lightCtrl', 0, 'onOff', !data, function (err, val) {
            if (err)
                return console.log(err);
        });
    });
}, 1000);

//----  button
var m = require('mraa'),
    SmartObject = require('smartobject');

var so = new SmartObject({
    led: new m.Gpio(44),
    button: new m.Gpio(40)
}, function () {
    this.hal.led.dir(m.DIR_OUT);
    this.hal.button.dir(m.DIR_IN);
});

// Push Button Smart Object:
//  https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_button
so.init('pushButton', 0, {
    dInState: {
        read: function (cb) {
            var hal = this.parent.hal,
                buttonState = hal.button.read();

            process.nextTick(function () {
                cb(null, buttonState);
            });
        }
    }
});

// Poll the button
setInterval(function () {
    so.read('pushButton', 0, function (err, data) {
        var newLedState = data ? 1 : 0;

        if (err)
            return console.log(err);

        so.write('lightCtrl', 0, 'onOff', newLedState, function () {});
    });
}, 200);


// ####### we can do the same thing this way
so.init('pushButton', 0, {
    dInState: {
        read: function (cb) {
            var hal = this.parent.hal,
                buttonState = hal.button.read();

            hal.led.write(!buttonState);
            process.nextTick(function () {
                cb(null, buttonState);
            });
        }
    }
});

setInterval(function () {
    so.read('pushButton', 0, function (err, data) {
        if (err)
            return console.log(err);
    });
}, 200);

//--- Protocol
// $ npm install mqtt-node --save

var MqttNode = require('mqtt-node');
var qnode = new MqttNode('simple_client', so);

qnode.on('ready', function () {
    // You can start to run your local app, such as showing the sensed value on an OLED monitor.
    // To interact with your Resources, simply use the handy APIs provided by SmartObject class.

    console.log('>> MQTT node is ready. But not connect to a server yet');
    console.log('>> Fast blink the led for 3 times');

    // Connect to the server 10 seconds later
    setTimeout(function () {
        // here, 192.168.0.2 is the server ip
        qnode.connect('mqtt://192.168.0.2');
    }, 10000);
});

qnode.on('registered', function () {
    // Your qnode is now in the network. This event only fires at the first time of qnode registered to the Server.
    console.log('>> MQTT node is registered to a server');
});

qnode.on('login', function () {
    // Your qnode is now ready to accept remote requests from the Server. Don't worry about the 
    // REQ/RSP things, qnode itself will handle them for you.  
    console.log('>> MQTT node logs in the network');
});

