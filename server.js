var util = require('util');
var ankiNodeUtils = require('./ankiNodeUtils.js')();
var trackMap = require('./trackMap.js')();

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

/**
 * @api {post} /connect/:carname connect
 * @apiName connect
 * @apiGroup Communications
 * @apiVersion 1.0.0
 * @apiDescription
 * This is typically not needed.  All other APIs will automatically connect if needed.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/connect/Guardian

 * @apiSampleRequest http://ankipi:7877/connect/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/connect/:carname', function (req, res) {
    var carName = req.params.carname
    console.log("Trying to connect to "+carName)
    ankiNodeUtils.connectCar(carName);
    res.send(JSON.stringify({ result: "Success"}));
    res.end();
});

/**
 * @api {post} /disconnect/:carname disconnect
 * @apiName disconnect
 * @apiGroup Communications
 * @apiVersion 1.0.0
 * @apiDescription
 * Use this to disconnect from the car so it can be used in a game.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/disconnect/Guardian
 *
 * @apiSampleRequest http://ankipi:7877/disconnect/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/disconnect/:carname', function (req, res) {
    var carName = req.params.carname
    console.log("Trying to disonnect to "+carName)
    ankiNodeUtils.disconnectCar(carName);
    res.send(JSON.stringify({ result: "Success"}));
    res.end();
});

/**
 * @api {post} /setSpeed/:carname/:speed setSpeed
 * @apiName setSpeed
 * @apiGroup Drive
 * @apiVersion 1.0.0
 * @apiDescription
 * This will start or stop(speed = 0) a car.  Typical values are from 300 - 1200.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 * @apiParam {Number} speed Speed (From about 300-1200. This is mm/sec)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/setSpeed/Guardian/600
 *
 * @apiSampleRequest http://ankipi:7877/setSpeed/:carname/:speed
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/setSpeed/:carname/:speedValue', function (req, res) {
  var carName = req.params.carname
  var speed = req.params.speedValue
  ankiNodeUtils.setSpeed(carName,speed);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /changeLanes/:carname/:changeValue changeLanes
 * @apiName changeLanes
 * @apiGroup Drive
 * @apiVersion 1.0.0
 * @apiDescription
 * Move the care left or right.  This is relative to a given offset (/setLaneOffset).
 * Typically, with zero in the centre of the track,
 * +68 - Far right lane
 * +24 - Middle right lane
 * -24 - Middle left lane
 * 068 - Far left lane
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 * @apiParam {Number} changeValue Value (Change value -68 - +68)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/changeLanes/Skull/24
 *
 * @apiSampleRequest http://ankipi:7877/changeLanes/:carname/changeValue
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/changeLanes/:carname/:changeValue', function (req, res) {
  var carName = req.params.carname
  var change = req.params.changeValue
  ankiNodeUtils.changeLanes(carName,change);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /setLaneOffset/:carname/:changeValue setLaneOffset
 * @apiName setLaneOffset
 * @apiGroup Drive
 * @apiVersion 1.0.0
 * @apiDescription
 * Set a lane offset for a given car.  All future changeLanes commands are relative to this point.
 * Ideally, this is set based on where the car is currently located
 * +68 - Far right lane
 * +24 - Middle right lane
 * -24 - Middle left lane
 * 068 - Far left lane
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 * @apiParam {Number} changeValue Value (Change value -68 - +68)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/setLaneOffset/Ground%20Shock/68
 *
 * @apiSampleRequest http://ankipi:7877/setLaneOffset/:carname/:changeValue
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/setLaneOffset/:carname/:changeValue', function (req, res) {
  var carName = req.params.carname
  var change = req.params.changeValue
  ankiNodeUtils.setLaneOffset(carName,change);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /turnOnHeadlights/:carname turnOnHeadlights
 * @apiName turnOnHeadlights
 * @apiGroup Lights
 * @apiVersion 1.0.0
 * @apiDescription
 * Turn on the front flashing headlights.  This simulates the car shooting forward weapons.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/turnOnHeadlights/Nuke
 *
 * @apiSampleRequest http://ankipi:7877/turnOnHeadlights/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/turnOnHeadlights/:carname', function (req, res) {
  result = ankiNodeUtils.setLights(req.params.carname,0x44);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /turnOffHeadlights/:carname turnOffHeadlights
 * @apiName turnOffHeadlights
 * @apiGroup Lights
 * @apiVersion 1.0.0
 * @apiDescription
 * Turn off the front flashing headlights.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/turnOffHeadlights/Nuke
 *
 * @apiSampleRequest http://ankipi:7877/turnOffHeadlights/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/turnOffHeadlights/:carname', function (req, res) {
  result = ankiNodeUtils.setLights(req.params.carname,0x04);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /turnOnTaillights/:carname turnOnTaillights
 * @apiName turnOnTaillights
 * @apiGroup Lights
 * @apiVersion 1.0.0
 * @apiDescription
 * Turn on the back tail lights.  This is a solid red light.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/turnOnTaillights/Guardian
 *
 * @apiSampleRequest http://ankipi:7877/turnOnTaillights/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/turnOnTaillights/:carname', function (req, res) {
  result = ankiNodeUtils.setLights(req.params.carname,0x22);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /flashTaillights/:carname flashTaillights
 * @apiName flashTaillights
 * @apiGroup Lights
 * @apiVersion 1.0.0
 * @apiDescription
 * Flash the back tail lights.  This is a blinking red light.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/flashTaillights/Thermo
 *
 * @apiSampleRequest http://ankipi:7877/flashTaillights/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/flashTaillights/:carname', function (req, res) {
  result = ankiNodeUtils.setLights(req.params.carname,0x88);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /turnOffTaillights/:carname turnOffTaillights
 * @apiName turnOffTaillights
 * @apiGroup Lights
 * @apiVersion 1.0.0
 * @apiDescription
 * Turn off the back tail lights.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/turnOffTaillights/Thermo
 *
 * @apiSampleRequest http://ankipi:7877/turnOffTaillights/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/turnOffTaillights/:carname', function (req, res) {
  result = ankiNodeUtils.setLights(req.params.carname,0x02);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {post} /setEngineLight/:carname/:red/:green/:blue setEngineLight
 * @apiName setEngineLight
 * @apiGroup Lights
 * @apiVersion 1.0.0
 * @apiDescription
 * Set the colour of the engine light.
 *
 * @apiParam {string} carname Name of the car (e.g. Skull, Thermo, etc)
 * @apiParam {number=0-15} red Red value (0-15)
 * @apiParam {number=0-15} green Green value (0-15)
 * @apiParam {number=0-15} blue Blue value (0-15)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/setEngineLight/Skull/15/0/15
 *
 * @apiSampleRequest http://ankipi:7877/setEngineLight/:carname/:red/:green/:blue
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/setEngineLight/:carName/:red/:green/:blue', function (req, res) {
  ankiNodeUtils.setEngineLight(req.params.carName,req.params.red,req.params.green,req.params.blue);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {get} /ping/:carname ping
 * @apiName ping
 * @apiGroup Communications
 * @apiVersion 1.0.0
 * @apiDescription
 * Try and communicate with a given car.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/ping/Skull
 *
 * @apiSampleRequest http://ankipi:7877/ping/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "ping": "Success"
 * }
 */
app.get('/ping/:carname', function (req, res) {
  ankiNodeUtils.ping(req.params.carname).then(function(data) {
    res.send(JSON.stringify({ ping: data}));
    console.log("Returning value");
    res.end();
  });
});

/**
 * @api {get} /batteryLevel/:carname batteryLevel
 * @apiName batteryLevel
 * @apiGroup Communications
 * @apiVersion 1.0.0
 * @apiDescription
 * Get the current battery level of the car.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/batteryLevel/Skull
 *
 * @apiSampleRequest http://ankipi:7877/batteryLevel/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   {"battery":97}
 * }
 */
app.get('/batteryLevel/:carname', function (req, res) {
  ankiNodeUtils.batteryLevel(req.params.carname).then(function(level) {
    res.send(JSON.stringify({ battery: level}));
    console.log("Returning value");
    res.end();
  });
});

//////////////////////////////////////////////////////////
// Do a U-Turn
//////////////////////////////////////////////////////////
app.get('/uturn/:carname', function (req, res) {
  ankiNodeUtils.uTurn(req.params.carname);
  res.send(JSON.stringify({ result: "Success"}));
  res.end();
});

/**
 * @api {get} /getDevices getDevices
 * @apiName getDevices
 * @apiGroup Communications
 * @apiVersion 1.0.0
 * @apiDescription
 * Get a list of currently scanned devices
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/getDevices
 *
 * @apiSampleRequest http://ankipi:7877/getDevices
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {"carList":
 *  [{"carName":"Ground Shock","address":"cc:1e:be:1e:ac:c9",
 *             "state":"disconnected","serviceUuids":"be15beef6186407e83810bd89c4d8df4"},
 *   {"carName":"Skull","address":"d1:02:53:f9:e9:a9",
 *             "state":"disconnected","serviceUuids":"be15beef6186407e83810bd89c4d8df4"},
 *   {"carName":"Guardian","address":"fd:e3:0e:42:e2:71",
 *             "state":"disconnected","serviceUuids":"be15beef6186407e83810bd89c4d8df4"},
 *   {"carName":"Thermo","address":"fb:05:e0:d5:5f:b5",
 *             "state":"disconnected","serviceUuids":"be15beef6186407e83810bd89c4d8df4"}]}
 * }
 */
app.get('/getDevices', function (req, res) {
  res.contentType('application/json');
  res.send(JSON.stringify({ carList: carList}));
  res.end();
});

/**
 * @api {post} /rescan rescan
 * @apiName rescan
 * @apiGroup Communications
 * @apiVersion 1.0.0
 * @apiDescription
 * Do a bluetooth rescan for cars.
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/rescan
 *
 * @apiSampleRequest http://ankipi:7877/rescan
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/rescan', function (req, res) {
    console.log("Rescan");
    ankiNodeUtils.rescan();
    res.send(JSON.stringify({ result: "Success"}));
    res.end();
});

/**
 * @api {post} /turnOnLogging/:carname turnOnLogging
 * @apiName turnOnLogging
 * @apiGroup Communications
 * @apiVersion 1.0.0
 * @apiDescription
 * Turn on server-side logging for the car.  This is used for debugging purposes.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/turnOnLogging/Skull
 *
 * @apiSampleRequest http://ankipi:7877/turnOnLogging/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/turnOnLogging/:carname', function (req, res) {
    var carName = req.params.carname
    console.log("turn on logging: "+carName);
    ankiNodeUtils.turnOnLogging(carName);
    res.send(JSON.stringify({ result: "Success"}));
    res.end();
});

/**
 * @api {post} /trackCountTravel/:carname/:trackCount/:speed trackCountTravel
 * @apiName trackCountTravel
 * @apiGroup Drive
 * @apiVersion 1.0.0
 * @apiDescription
 * Have a given car travel 'trackCount' segments at a given speed.
 *
 * @apiParam {String} carname Name of the car (e.g. Skull, Thermo, etc)
 * @apiParam {Number} trackCount Number of tracks segments to travel before stopping.
 * @apiParam {Number} speed Speed (From about 300-1200. This is mm/sec)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877//trackCountTravel/Skull/15/800
 *
 * @apiSampleRequest http://ankipi:7877/trackCountTravel/:carname/:trackCount/:speed
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.post('/trackCountTravel/:carname/:trackCount/:speed', function (req, res) {
    var carName = req.params.carname
    var trackCount = req.params.trackCount
    var speed = req.params.speed
    console.log("trackCountTravel: "+carName+" - "+trackCount+" - "+speed);
    ankiNodeUtils.trackCountTravel(carName,trackCount,speed);
    res.send(JSON.stringify({ result: "Success"}));
    res.end();
});

/**
 * @api {post} /mapTrack/:carname mapTrack
 * @apiName mapTrack
 * @apiGroup Mapping
 * @apiVersion 1.0.0
 * @apiDescription
 * Build a map of the existing track.  To use, place a car on the track (in the 'right direction based on starting line) and call this api.  Once the car completes two passes over the starting line, the track map will be complete and the car will stop.  Then, the '/getTrackMap' API will be active.
 *
 * @apiParam {String} carname Name of the car to be used to map the track. (e.g. Skull, Thermo, etc)
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://ankipi:7877/mapTrack/Skull
 *
 * @apiSampleRequest http://ankipi:7877/mapTrack/:carname
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 *   UTF8 - image/png
 */
app.post('/mapTrack/:carname', function (req, res) {
    var carName = req.params.carname
    console.log("Mapping the track using car: "+carName);
    ankiNodeUtils.mapTrack(carName,trackMap);
    res.send(JSON.stringify({ result: "Success"}));
    res.end();
});

/**
 * @api {get} /getTrackMapData getTrackMapData
 * @apiName getTrackMapData
 * @apiGroup Mapping
 * @apiVersion 1.0.0
 * @apiDescription
 * Get a map data of the existing track.  This returns an array of numbers.<br>
 * These numbers mean:<br>
 *  0 - No track<br>
 *  1 - Start/Finish<br>
 *  2 - Straight Horizontal<br>
 *  3 - Straight Vertical<br>
 *  4 - Curve - North -> East (West -> South)<br>
 *  5 - Curve - East -> South (North -> West)<br>
 *  6 - Curve - West -> North (South -> East)<br>
 *  7 - Curve - South -> West (East -> North)<br>
 *  8 - Straight Horizontal over Vertical<br>
 *  9 - Straight Vertical over Horizontal<br>
 * 10 - Curve - North -> East over Vertical<br>
 * 11 - Curve - North -> West over Vertical<br>
 * 12 - Curve - South -> East over Vertical<br>
 * 13 - Curve - South -> West over Vertical<br>
 * 14 - Curve - North -> East over Horizontal<br>
 * 15 - Curve - North -> West over Horizontal<br>
 * 16 - Curve - South -> East over Horizontal<br>
 * 17 - Curve - South -> West over Horizontal<br>
 *
 * Note: This will return an error message unless '/mapTrack' has been run.
 *
 * @apiExample {curl} Example usage:
 *     curl -i -X GET http://ankipi:7877/getTrackMapData
 *
 * @apiSampleRequest http://ankipi:7877/getTrackData
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "map": "[[0,0],[1,2],[3,2],[5,6]]"
 * }
 */
app.get('/getTrackMapData', function (req, res) {
    var size = req.params.size
    if(trackMap.isTrackMapDone() == false) {
      res.send(JSON.stringify({ result: "Error", message: "Track map has not completed.  Use '/mapTrack' API and wait for the car to stop."}));
      res.end();
      return;
    }
    var mapArray = trackMap.getTrackMapData();
    res.send(JSON.stringify({ map: mapArray}));
    res.end();
});

/**
 * @api {get} /getTrackMap/:size getTrackMap
 * @apiName getTrackMap
 * @apiGroup Mapping
 * @apiVersion 1.0.0
 * @apiDescription
 * Get a map of the existing track.  Note: This will return an error message unless '/mapTrack' has been run.
 *
 * @apiParam {String} size Size of the png image returned. (Values: small, medium, large) (64px/track,128px/track,256px/track)
 *
 * @apiExample {curl} Example usage:
 *     curl -i -X GET http://ankipi:7877/getTrackMap/medium
 *
 * @apiSampleRequest http://ankipi:7877/getTrackMap/:size
 * @apiSuccessExample Success-Response
 * HTTP/1.1 200 OK
 * {
 *   "result": "Success"
 * }
 */
app.get('/getTrackMap/:size', function (req, res) {
    var size = req.params.size
    if(size != "small" && size != "medium" && size != "large") {
      res.send(JSON.stringify({ result: "Error", message: "Size must be 'small', 'medium' or 'large'"}));
      res.end();
      return;
    }
    if(trackMap.isTrackMapDone() == false) {
      res.send(JSON.stringify({ result: "Error", message: "Track map has not completed.  Use '/mapTrack' API and wait for the car to stop."}));
      res.end();
      return;
    }
    var canvas = trackMap.getTrackMap(size);
//    res.send('<img src="' + canvas.toDataURL() + '" />');
    var stream = canvas.createPNGStream();
    res.type("png");
    stream.pipe(res);   
});

app.use('/', express.static('apidoc'));

//////////////////////////////////////////////////////////
// Start listener
//////////////////////////////////////////////////////////
var server = app.listen(7877, function () {
  console.log("Example app listening at http://pi:7877");
  var host="pi";
  var port="7877";
  console.log("http://%s:%s/getDevices",host,port);
  console.log("http://%s:%s/connect/:carname",host,port);
  console.log("http://%s:%s/setSpeed/:carname/:speedValue",host,port);
  console.log("http://%s:%s/setLights/:carname/:lightValue",host,port);
})
