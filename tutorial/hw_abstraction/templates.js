var SmartObject = require('smartobject');
var so = new SmartObject();

module.exports = so;
// https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_temperature

// (1) LED - Light Control (oid = 3311 or 'lightCtrl')
so.init('lightCtrl', 0, {
    onOff: {                        // < rid = 5850, RW, Boolean { 0: off, 1: on } >
        read: function (cb) {},
        write: function (cb) {}
    }
});

// (2) On/Off Switch (oid = 3342 or 'onOffSwitch')
so.init('onOffSwitch', 0, {
    dInState: {                     // < rid = 5500, R, Boolean >
        read: function (cb) {}
    },
    // counter: ,                   // < rid = 5501,  R, Integer >
    // onTime: ,                    // < rid = 5852, RW, Integer, s >
    // offTime: ,                   // < rid = 5854, RW, Integer, s >
    // appType:                     // < rid = 5750, RW, String >
});

// (3) Push Button (oid = 3347 or 'pushButton')
so.init('pushButton', 0, {
    dInState: {                     // < rid = 5500, R, Boolean >
        read: function (cb) {}
    },
    // counter: ,                   // < rid = 5501,  R, Integer >
    // appType:                     // < rid = 5750, RW, String >
});

// (4) Temperature Sensor (oid = 3303 or 'temperature')
so.init('temperature', 0, {
    sensorValue: {                  // < rid = 5700, R, Float >
        read: function (cb) {}
    },
    // units: ,                     // < rid = 5701, R, String >
});

// (5) Humidity Sensor (oid = 3304 or 'humidity')
so.init('humidity', 0, {
    sensorValue: {                  // < rid = 5700, R, Float >
        read: function (cb) {}
    },
    // units: ,                     // < rid = 5701, R, String >
})

// (6) Presence Sensor (oid = 3302 or 'presence')
so.init('presence', 0, {
    dInState: {                     // < rid = 5500, R, Boolean >
        read: function (cb) {}
    },
    // counter: ,                   // < rid = 5501,  R, Integer >
    // counterReset: ,              // < rid = 5505,  E, Opaque >
    // sensorType: ,                // < rid = 5751,  R, String >
    // busyToClearDelay: ,          // < rid = 5903, RW, Integer, ms >
    // clearToBusyDelay:            // < rid = 5904  RW, Integer, ms >
});

// (7) Light Bulb - Light Control (oid = 3311 or 'lightCtrl')
so.init('lightCtrl', 0, {
    onOff: {                        // < rid = 5850, RW, Boolean { 0: off, 1: on } >
        read: function (cb) {},
        write: function (cb) {}
    }
});

// (8) Buzzer (oid = 3338 or 'buzzer')
so.init('buzzer', 0, {
    onOff: {                        // < rid = 5850, RW, Boolean >
        read: function (cb) {},
        write: function (val, cb) {}
    },
    // level: ,                     // < rid = 5548, RW, Float {100} >
    // timeDuration: ,              // < rid = 5521, RW, Float >
    // minOffTime: ,                // < rid = 5525, RW, Float >
    // appType:                     // < rid = 5750, RW, String >
});
