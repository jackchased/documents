var so=  require('./smartobj.js')

var so = new SmartObject({
    led: new m.Gpio(44),
    button: new m.Gpio(19)
}, function () {
    var self = this;

    this.hal.led.dir(m.DIR_OUT);
    this.hal.button.dir(m.DIR_IN);

    this.hal.blinkLed = function (times) {
        var ledState = true;
        times = 2 * times;

        var blinker = setInterval(function () {
            self.hal.led.write(ledState ? 1 : 0);
            ledState = !ledState;
            times -= 1;
            if (times === 0)
                clearInterval(blinker);
        } ,200);
    };
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

var MqttNode = require('mqtt-node');
var qnode = new MqttNode('test_node', so);

qnode.on('ready', function () {
    // You can start to run your local app, such as showing the sensed value on an OLED monitor.
    // To interact with your Resources, simply use the handy APIs provided by SmartObject class.

    console.log('>> MQTT node is ready. But not connect to a server yet');
    console.log('>> Blink the led for few times');
    so.hal.blinkLed(10);
    // Connect to the server 10 seconds later
    setTimeout(function () {
        // here, 192.168.0.2 is the server ip
        console.log('>> Connect to a server...');
        qnode.connect('mqtt://192.168.11.5');

        // Poll the button
        setInterval(function () {
            so.read('pushButton', 0, 'dInState', function (err, data) {
                var newLedState = data ? 1 : 0;
                if (err)
                    return console.log(err);

                so.write('lightCtrl', 0, 'onOff', newLedState, function () {});
            });
        }, 200);
    }, 6000);
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
