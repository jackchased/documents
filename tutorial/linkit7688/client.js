// On Linkit Smart 7688
// $ npm install smartobject --save
// $ npm install mqtt-node --save

var m = require('mraa'),
    SmartObject = require('smartobject');

var so = new SmartObject({
    led1,
    led2,
    led3
});

// Light Control Smart Object:
//  https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_lightCtrl
so.init('lightCtrl', 0, {
    onOff: {
        read: function (cb) {
            var state = this._private.led.read();
            cb(null, state);
        },
        write: function (val, cb) {
            this._private.led.write(val);
            this.read(cb);
        }
    }
}, function () {
    this.config.led = new m.Gpio(44); // Hardware: LED on the board
    this.config.led.dir(m.DIR_OUT);
});

