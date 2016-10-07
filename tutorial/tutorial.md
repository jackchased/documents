# Tutorial [ Under Construction - Go Away! XDD ]
This tutorial will show you how to build an IoT webapp with mqtt-shephed and mqtt-node

### Modules
* mqtt-shepherd
* mqtt-node
* express
* socket.io

## Table of Contents

1. [Overview](#Overview)
2. [LWMQN Server](#LwmqnServer)
3. [LWMQN Client](#LwmqnClient)
4. [Client/Server](#ClientServer)
5. [Machine Gateway](#Gateway)
6. [APIs and Events](#APIs)
7. [Message Encryption](#Encryption)
8. [Debug Messages](#Debug)

<a name="Overview"></a>
## 1. Overview

For building your IoT machine network, there are serveral options you can take to do the job. 
[TBD]

<a name="LwmqnServer"></a>
## 2. LWMQN Server

```js
// qserver.js
var MattShepehrd = require('mqtt-shepherd');
var qserver = new MqttShepherd('my_iot_server');

qserver.on('ready', function () {});

qserver.start(function (err) {});
```

Run it:

```sh
$ node qserver
```

<a name="LwmqnClient"></a>
## 3. LWMQN Client

### Prepare the Smart Object

* 1 temperature sensor, 1 illuminance sensor, 1 on/off switch, 1 light bulb, 1 fan
* [Illuminance sensor code template](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_illumSensor)
* [On/Off Switch code template](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_switch)
* [Light control code template](https://github.com/PeterEB/smartobject/blob/master/docs/templates.md#tmpl_lightCtrl)

* qclient/components/smartobject.js
* Since we are not using any hardware yet, but that's ok. Just use some variables as the mocks.
```js
/***************************************/
var lightStatus = 0;    // 0: off, 1: on
var switchStatus = 0;   // 0: off, 1: on

/***************************************/

var SmartObject = require('smartobject');

var so = new SmartObject();

so.init('temprature', 0, {
    sensorValue: 20,
    units: 'percent'
});

so.init('temprature', 1, {
    sensorValue: 20,
    units: 'percent'
});

so.init('illuminance', 0, {
    sensorValue: 20,
    units: 'percent'
});

so.init('onOffSwitch', 0, {
    dInState: {
        read: function (cb) {
            process.nextTick(function () {
                cb(null, switchStatus);
            });
        }
    }
});

so.init('lightCtrl', 0, {
    onOff: {
        read: function (cb) {

        },
        write: function (cb) {

        }
    }
});

module.exports = so;
```

* Client
```js
var MqttNode = require('mqtt-node');
var so = require('./components/smartobject.js')

var qnode = new MqttNode('my_foo_client_id', so);

qnode.on('ready', function () {});
qnode.on('registered', function () {});
qnode.on('login', function () {});

qnode.connect('mqtt://192.168.0.100');  // mqtt://localhost
```

### MT7688 Example

<a name="ClientServer"></a>
## 4. Client/Server


<a name="Gateway"></a>
## 5. Machine Gateway

* npm install express --save
* npm install body-parser --save

* App Structure

```sh
$ express webapp
$ cd webapp && npm install
.
|--- app.js
|--- bin
|    |___ www
|--- package.json
|--- public
|    |___ images
|    |___ javascripts
|    |___ stylesheets
|         |___ style.css
|--- route
|    |___ index.js
|    |___ users.js
|___ views
     |___ error.jade
     |___ index.jade
     |____ layout.jade
```

```js
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.get('/', function (req, res, next) {
    // ... 
    next();
});

app.post();

// rest apis

app.listen(3000);
```



