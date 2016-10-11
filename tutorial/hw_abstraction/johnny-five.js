var five = require('johnny-five');
var board = new five.Board();

board.on('ready', function () {
    // button
    // Create a new `button` hardware instance.
    var button = new five.Button(2);

    button.on("hold", function() {
        console.log( "Button held" );
    });

    button.on("press", function() {
        console.log( "Button pressed" );
    });

    button.on("release", function() {
        console.log( "Button released" );
    });

    // led
    var led = new five.Led(13);
    led.blink(500);

    // Accelerometer 
    var accelerometer new five.Accelerometer({
      pins: ["A0", "A1"]    // X and Y axis pins
    });

    accelerometer.on("change", function() {
        console.log("X: %d", this.x);
        console.log("Y: %d", this.y);
    });

    // Altimeter
    var altimeter = new five.Altimeter({
        controller: "MPL3115A2"
    });

    altimeter.on("data", function() {
        console.log("Altitude");
        console.log("  feet   : ", this.feet);
        console.log("  meters : ", this.meters);
        console.log("--------------------------------------");
    });

    // Barometer
    var barometer = new five.Barometer({
        controller: "MPL115A2"
    });

    barometer.on("data", function() {
        console.log("barometer");
        console.log("  pressure : ", this.pressure);
        console.log("--------------------------------------");
    });

    // Hygrometer
    var hygrometer = new five.Hygrometer({
        controller: "HTU21D"
    });

    hygrometer.on("change", function() {
        console.log(this.relativeHumidity + " %");
    });

    // And many more
});


