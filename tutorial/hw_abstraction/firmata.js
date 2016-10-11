//------ firmata
var Board = require("firmata");
var board = new Board("path to serialport", function() {
  // Arduino is ready to communicate 
});  


