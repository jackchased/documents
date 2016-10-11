//------ mraa
var m = require('mraa');
var led = new m.Gpio(2);
led.dir(m.DIR_OUT);

// led.write(1);
// led.write(0);

