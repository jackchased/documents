# Section A: How to use SmartObject
  
Let's abstract a led and a push button into a smart object, on the Linkit 7688 board

### 1. ssh into the board

```
ssh root@192.168.11.6   # replace the ip with yours
```

### 2. Create a folder /app and a **smartobj.js** in it

```sh
mkdir app && cd app
```
```sh
touch smartobj.js
```

### 3. Install the `smartobject` module in /app folder

```sh
npm install smartobject
```

### 4. Edit **smartobj.js**, we will use `mraa` as the hal controller

* [[1] SmartObject Constructor](https://github.com/PeterEB/smartobject#API_smartobject)  
* [[2] Light Control Object Instance code template](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_lightCtrl)
* [[3] Create an Object Instance](https://github.com/PeterEB/smartobject#API_init)
  
```js
var m = require('mraa'),
    SmartObject = require('smartobject');

var so = new SmartObject({
    led: new m.Gpio(44)             // onboard wifi led (the orange one)
}, function () {
    this.hal.led.dir(m.DIR_OUT);    // hardware initialization, see [1]
});

// Create a Light Control Object Instance in so, see [2] and [3]
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

// Use so.read() and so.write() methods to blink the led for few times
// We will use a led blink driver to replace this snippet later
var times = 20;
var blinker = setInterval(function () {
    times -= 1;
    if (times === 0)
        clearInterval(blinker);

    so.read('lightCtrl', 0, 'onOff', function (err, data) {
        if (err)
            return console.log(err);

        so.write('lightCtrl', 0, 'onOff', !data, function (err, val) {
            if (err)
                return console.log(err);
        });
    });
}, 200);
```

### 5. Test the led

```sh
node smartobj.js
```

### 6. Make a led blink driver

Let make a led bink driver in our `hal`.

```js
var m = require('mraa'),
    SmartObject = require('smartobject');

// Add our led blink driver to hal
var so = new SmartObject({
    led: new m.Gpio(44),
    blinkLed: null      // we'll implement the driver in the setup function
}, function () {
    var self = this;

    this.hal.led.dir(m.DIR_OUT);

    this.hal.blinkLed = function (times) {
        times = 2 * times;

        var ledState = true;
        var blinker = setInterval(function () {
            self.hal.led.write(ledState ? 1 : 0);
            ledState = !ledState;
            times -= 1;
            if (times === 0)
                clearInterval(blinker);
        }, 200);
    }
});

so.init('lightCtrl', 0, {
    // ... code remains the same
});

// Blink our led by the driver
so.hal.blinkLed(20);
```

### 7. Test the led blink driver

```sh
node smartobj.js
```

### 8. Use SmartObject Methods in Driver

In our example, the led is an Object Instance `'lightCtrl'`. We encourage users to operate their hardware with `so` read/write methods if the hardware is an Object Instance. By this way, `so` can find out the resource changes to report to the server if creating machines with `mqtt-node` or `coap-node` modules. If the hardware is not a smart object but simply a onboard thing, like a led indicator, then it is fine to write a driver we've seen in step 6.

```js
// Add our led blink driver to hal
var so = new SmartObject({
    led: new m.Gpio(44),
    blinkLed: null
}, function () {
    var self = this;

    this.hal.led.dir(m.DIR_OUT);

    this.hal.blinkLed = function (times) {
        times = 2 * times;

        var ledState = true;
        var blinker = setInterval(function () {
            // Use so method
            self.write('lightCtrl', 0, 'onOff', ledState ? 1 : 0, function (err, val) {
                if (err)
                    return console.log(err);
                else
                    ledState = !ledState;
            });
            
            times -= 1;
            if (times === 0)
                clearInterval(blinker);
        }, 200);
    }
});
```
  
## 9. The push button

```js
var m = require('mraa'),
    SmartObject = require('smartobject');

// Add our led blink driver to hal
var so = new SmartObject({
    led: new m.Gpio(44),
    button: new m.Gpio(19), // pin p27 on Linkit 7688
    blinkLed: null,
    pollButton: null        // we'll implement the poller in the setup function
}, function () {
    var self = this;

    this.hal.led.dir(m.DIR_OUT);
    this.hal.button.dir(m.DIR_IN);  // set up direction for the button gpio

    this.hal.blinkLed = function (times) {
        // ... code remains the same
    };

    this.hal.pollButton = function () {
        setInterval(function () {
            self.read('pushButton', 0, 'dInState', function (err, data) {
                var buttonState = data;
                if (err)
                    return console.log(err);

                // Led will light up acoording to the button state
                self.write('lightCtrl', 0, 'onOff', buttonState ? 1 : 0, function () {});
            });
        });
    };
});

so.init('lightCtrl', 0, {
    // ... code remains the same
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

// Start to poll the button
so.hal.pollButton();
```

### 10. Test the push button and watch the led

```sh
node smartobj.js
```

<br />
<br />
# Section B: Network Protocol Comes In

In this section, we will use **lightweight MQTT machine network(LWMQN)** to build the IoT network. At server side, we'll use `mqtt-shepherd` to create the LWMQN server, and use `mqtt-node` on our Linkit 7688 machine to create the LWMQN client. You can build a CoAP network with `coap-shepherd` and `coap-node` as well, they follow the similar pattern with `smartobject` module.  

## Client-side (On our Linkit 7688 machine)

### 1. Our `so` is a module that abstract all the hardware and drivers

In step 9@section A, we've build a nice smart object in **smartobj.js**, let's add the following line to the end of the file:

```js
var m = require('mraa'),
    SmartObject = require('smartobject');

// ... code remains the same

// take off this line for our demo can go nicely
// (since we'll let the led blink when machine booted up, but the led is also controlled by the button. That conflicts.)
// so.hal.pollButton();

// export our so
module.exports = so;
```

Abstracting the hardware is kind of boring, but once we've packaged it up, we can ship it and resuse it anytime (npm publish it, and use it everywhere)! And you know what? To access the hardware is pretty simple with the smartobject read/write interfaces. This is the best practice of the node.js **small surface area** philosophy.  


### 2. Install the `mqtt-node` module in /app folder (takes minutes)

```sh
npm install mqtt-node
```

### 3. Create a file **client.js** in /app folder and write some code

* [[1] mqtt-node basic usage](https://github.com/lwmqn/mqtt-node#Basic)

```js
var so = require('./smartobj.js'),
    MqttNode = require('mqtt-node');

// see [1], our machine is named with cliendId = 'test_node'
var qnode = new MqttNode('test_node', so);

qnode.on('ready', function () {
    console.log('>> MQTT node is ready. But not connect to a server yet');
    console.log('>> Blink the led for few times');
    so.hal.blinkLed(10);

    // Connect to the server 6 seconds later
    setTimeout(function () {
        console.log('>> Connect to a server...');
        qnode.connect('mqtt://192.168.11.5');   // replace 192.168.11.5 with your server ip

        // Poll the button
        so.hal.pollButton();
    }, 6000);
});

qnode.on('registered', function () {
    console.log('>> MQTT node is registered to a server');
});

qnode.on('login', function () {
    console.log('>> MQTT node logs in the network');
});
```

## Server-side (On our PC, RaspberryPi, or BeagleBone)

### 1. Create a folder /qserver and a server.js in it

```sh
mkdir qserver && cd qserver
```
```sh
touch server.js
```

### 2. Install the `mqtt-shepherd` module in /qserver folder

```sh
npm install mqtt-shepherd
```

### 4. Edit server.js

Generally speaking, it's better to have a GUI (like a dashboard) to be interacting along with the network management APIs, such as qserver.list() and qserver.find(). But for a demo purpose, I directly write some hard-coded lines to show the client/server interactions. This demo will first get the led and button status back from the remote machine, and then start to observe the led status changes.

* [[1] mqtt-shepherd basic usage](https://github.com/lwmqn/mqtt-shepherd#Basic)
* [[2] qserver 'ind' event and qnode APIs](https://github.com/lwmqn/mqtt-shepherd#APIs)


```js
var util = require('util');
var MqttShepherd = require('mqtt-shepherd');
var qserver = new MqttShepherd();   // create a LWMQN server

// see [1]
qserver.on('ready', function () {
    console.log('Server is ready');
    console.log('Permit devices joining for 180 seconds');
    qserver.permitJoin(180);
});

qserver.start(function (err) {      // start the sever
    if (err)
        console.log(err);
});

// see [2]
qserver.on('ind', function (msg) {
    switch (msg.type) {
        case 'devIncoming':
            // When our 'test_node' comes in, we read the led and button current states back
            var qnode = msg.qnode;
            if (qnode.clientId === 'test_node') {
                qnode.readReq('lightCtrl/0/onOff', function (err, rsp) {
                    if (!err)
                        console.log('>> Current led state at machine: ' + rsp.data);    // rsp = { status, data }
                });

                qnode.readReq('pushButton/0/dInState', function (err, rsp) {
                    if (!err)
                        console.log('>> Current button state at machine: ' + rsp.data); // rsp = { status, data }
                });
            }
            break;

        case 'devStatus':
            // When 'test_node' is online, we tell the machine to report the led change to server
            var qnode = msg.qnode;
            if (qnode.clientId === 'test_node' && msg.data === 'online') {
                // setting for notification of led state reporting
                qnode.writeAttrsReq('lightCtrl/0/onOff', {
                    pmin: 1,
                    pmax: 60,
                    stp: 0.5    // since led state is 0 or 1, thus we measure if it changes with a step larger than 0.5
                }, function (err, rsp) {
                    console.log('>> Led report setting done: ');
                    console.log(rsp);
                });

                qnode.observeReq('lightCtrl/0/onOff', function (err, rsp) {
                    console.log('>> Led observation starts: ');
                    console.log(rsp);
                });
            }
            break;

        case 'devChange':
            // If led state changes, print it out
            var data = msg.data;
            if (data && data.oid === 'lightCtrl') {
                console.log('>> Led state at machine changed: ');
                console.log('    ' + util.inspect(data));
            }
            break;
        default:
            // Not deal with other msg.type in this example
            break;
    }
});
```

## Start the MQTT machine network

### At server-side (on our PC)

```sh
node server
```

### At client-side (on our Linkit 7688)

* The machine will first blink the led for few times, and then connect to the server

```sh
node client
```
