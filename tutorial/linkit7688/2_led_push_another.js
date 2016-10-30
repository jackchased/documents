var m = require('mraa'),
    SmartObject = require('smartobject');

var so = new SmartObject({
    led: new m.Gpio(44),
    button: new m.Gpio(19)
}, function () {
    this.hal.led.dir(m.DIR_OUT);
    this.hal.button.dir(m.DIR_IN);
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

            hal.led.write(!buttonState ? 1 : 0);
            process.nextTick(function () {
                cb(null, buttonState);
            });
        }
    }
});

setInterval(function () {
    so.read('pushButton', 0, 'dInState', function (err, data) {
        if (err)
            return console.log(err);
    });
}, 200);