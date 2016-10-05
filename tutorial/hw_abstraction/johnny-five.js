var five = require('johnny-five');
var board = new five.Board();

board.on('ready', function () {
    var led = new five.Led(13);
    led.blink(500);
});

//------ firmata
var Board = require("firmata");
var board = new Board("path to serialport", function() {
  // Arduino is ready to communicate 
});  

//------- firmata
var Board = require("firmata");
var board = new Board("path to serialport");
 
board.on("ready", function() {
  // Arduino is ready to communicate 
});  

//------ mraa
var m = require('mraa');
var led = new m.Gpio(2);
led.dir(m.DIR_OUT);

// led.write(1);
// led.write(0);

