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
