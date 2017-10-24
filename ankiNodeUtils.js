var async = require('async');
var noble = require('noble');
var messageParse = require('./messageParse.js')();
carList = [];
var writerCharacteristicList = [];
var readerCharacteristicList = [];
var peripheralList = [];

var MAX_BATTERY_LEVEL=4200;

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// Bluetooth Utilities
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

noble.on('stateChange', function(state) {
  console.log("BTLE State changed: "+state);
  if (state === 'poweredOn') {
    console.log("Start scanning");
    noble.startScanning();

    setTimeout(function() {
       console.log("Stop scanning");
       noble.stopScanning();
     }, 2000);
  } else {
    console.log("Stop scanning");
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  console.log("BTLE: discover");
  var id = peripheral.advertisement.serviceUuids;
  var manufacturerData = peripheral.advertisement.manufacturerData;
  //console.log(util.inspect(peripheral, false,null));
  
  // From SDK, get model_id (Byte 3)
  //typedef struct anki_vehicle_adv_mfg {
  //  uint32_t    identifier;
  //  uint8_t     model_id;
  //  uint8_t     _reserved;
  //  uint16_t    product_id;
  //} anki_vehicle_adv_mfg_t
  
  console.log("manufacturerData",manufacturerData);
  if(manufacturerData != null) {
      var model_data = manufacturerData[3]
      var carName = "Unknown"
      console.log("Model Data: "+model_data);
      switch(model_data) {
//        case 1: // Kourai
//          var carName = "Kourai"
//          break;
//        case 2: // Boson
//          var carName = "Boson"
//          break;
//        case 3: // Rho
//          var carName = "Rho"
//          break;
//        case 4: // Katal
//          var carName = "Katal"
//          break;
        case 8: // Ground Shock
          var carName = "Ground Shock"
          break;
        case 9: // Skull
          var carName = "Skull"
          break;
        case 10: // Thermo
          var carName = "Thermo"
          break;
        case 11: // Nuke
          var carName = "Nuke"
          break;
        case 12: // Guardian
          var carName = "Guardian"
          break;
        //case 14: // Big Bang
         // var carName = "Big Bang"
          //break;
        case 15: // Truck - Free Wheel
          var carName = "Free Wheel"
          break;
        case 16: // Truck - X52
          var carName = "X52"
          break;
        case 17: // Truck - X52 Ice
          var carName = "X52 Ice"
          break;
        default:
          break;
      }
      if(carName != "Unknown") {
        var address = peripheral.address;
        var state = peripheral.state;
        console.log('Found car: ' + carName + " ID: ["+id+"] Address: ["+address+"]"); 
        carList.push({carName: carName, address: address, state: state, serviceUuids: id[0]});
        peripheralList.push(peripheral);
      }
  }
});

noble.on('disconnect', function(peripheral) {
  console.log("BTLE: disconnect called");
});

//////////////////////////////////////////////////////////
// Rescan
//////////////////////////////////////////////////////////
var rescan = function() {
  carList = [];
  noble.startScanning();

  setTimeout(function() {
    noble.stopScanning();
  }, 2000);
}

//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
// Anki Utilities
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
// Turn on sdk mode
//////////////////////////////////////////////////////////
var turnOnSdkMode = function(writerCharacteristic) {
  console.log("Turn on SDK...");
  var sdkMessage = new Buffer(4);
  sdkMessage.writeUInt8(0x03, 0); // Msg Size
  sdkMessage.writeUInt8(0x90, 1); // ANKI_VEHICLE_MSG_C2V_SDK_MODE
  sdkMessage.writeUInt8(0x01, 2); // 0 = off / 1 = on
  sdkMessage.writeUInt8(0x01, 3); // "flags" - ANKI_VEHICLE_SDK_OPTION_OVERRIDE_LOCALIZATION (needed for other apis)
  writerCharacteristic.write(sdkMessage, false, function(err) {
    console.log("Turn on SDK done.");
  });
}

//////////////////////////////////////////////////////////
// Turn on logging for a given car
//////////////////////////////////////////////////////////
var turnOnLogging = function(carName) {
  getReaderCharacteristic(carName).then(function(readerCharacteristic){
    readerCharacteristic.notify(true, function(err) {
    });
    readerCharacteristic.on('read', function(data, isNotification) {
      messageParse.parse(data);
    });
  });
}


//////////////////////////////////////////////////////////
// Set Lane Offset - What lane the car should 'start' in.
//////////////////////////////////////////////////////////
var setLaneOffset = function(carName,change) {
  getWriterCharacteristic(carName).then(function(writerCharacteristic) {
    offsetMessage = new Buffer(6);
    offsetMessage.writeUInt8(0x05, 0); // ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER_SIZE
    offsetMessage.writeUInt8(0x2c, 1); // ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER
    offsetMessage.writeFloatLE(parseFloat(change), 2); // Offset value (?? 68,23,-23,68 seem to be lane values 1-4)

    console.log("Sending lane offset: "+change);
    writerCharacteristic.write(offsetMessage, false, function(err) {
      if(err) {
        console.log("Error: "+util.inspect(err, false,null));
      } else {
        console.log("Success");
      }
    });
  });
}

//////////////////////////////////////////////////////////
// Disconnect to a given car
//////////////////////////////////////////////////////////
var disconnectCar = function(carName) {
  console.log("Disconnect to car: "+carName);
  var peripheral = null;
  // See if we are already connected.
  for(var i=0; i<carList.length;i++) {
    if(carList[i].carName == carName) {
      peripheral = peripheralList[i];
    }
  }
  if(peripheral == null) {
    return ("Car already disconnected.");//TBD: Do a rescan and try again...
  }

  peripheral.disconnect(function(error) {
    console.log("Disconnected ",error);
    // Remove the reader/writer
    console.log("Reader Size: "+readerCharacteristicList.length)
    console.log("Writer Size: "+readerCharacteristicList.length)
    var readerIndex = -1;
    for(var i=0; i<readerCharacteristicList.length;i++) {
      if(readerCharacteristicList[i].carName == carName) {
        readerIndex = i;
      }
    }
    console.log("Reader Index: "+readerIndex);
    if(readerIndex > -1) {
      readerCharacteristicList.splice(readerIndex,1);
      writerCharacteristicList.splice(readerIndex,1);
    }
    console.log("Reader Size After: "+readerCharacteristicList.length)
    console.log("Writer Size After: "+readerCharacteristicList.length)
  });
}

//////////////////////////////////////////////////////////
// Connect to a given car
//////////////////////////////////////////////////////////
var connectCar = function(carName) {
  console.log("Connect to car: "+carName);
  // Note: The car name can be the actual name or the address.
  // If only one of a given car 'e.g. Skull' is around, it is easier to use the name.
  // If two or more cars with the same name are around, it is best to use the address.
  var peripheral = null;
  // See if we are already connected.
  if(carName == "Skull" ||
     carName == "Thermo" ||
     carName == "Guardian" ||
     carName == "Ground Shock" ||
     carName == "Nuke" ||
     carName == "Big Bang" ||
     carName == "Free Wheel" ||
     carName == "X52 Ice") {
    for(var i=0; i<carList.length;i++) {
      if(carList[i].carName == carName) {
        peripheral = peripheralList[i];
      }
    }
  } else {
    // Connect via ID
    for(var i=0; i<peripheralList.length;i++) {
      if(peripheralList[i].address == carName) {
        peripheral = peripheralList[i];
      }
    }
  }
  if(peripheral == null) {
    return ("Car not found");//TBD: Do a rescan and try again...
  }

  peripheral.on('disconnect', function() {
    console.log('Car has been disconnected');
  });

  // This connection is async, so return a promise.
  var connectPromise = new Promise(
    function(resolve,reject) {
      peripheral.connect(function(error) {
        console.log("Connected "+peripheral.uuid);
        peripheral.discoverServices(['be15beef6186407e83810bd89c4d8df4'], function(error, services) { // Grab write characteristic
          var service = services[0];

          service.discoverCharacteristics([], function(error, characteristics) {
            var characteristicIndex = 0;

            console.log("Characteristic Length: "+characteristics.length);
            for(var i=0;i < characteristics.length;i++) {
              console.log("Looping characteristics: "+i);
              var characteristic = characteristics[i];
              if (characteristic.uuid == 'be15bee06186407e83810bd89c4d8df4') {
                console.log("Adding readerChar for car" + carName);
                readerCharacteristicList.push({carName: carName, characteristic: characteristic});
              }
              if (characteristic.uuid == 'be15bee16186407e83810bd89c4d8df4') {
                writerCharacteristicList.push({carName: carName, characteristic: characteristic});
                turnOnSdkMode(characteristic);
              }
            }
            console.log("Done: ");
            resolve();
            return;
          });
        });
      });
    });
  return(connectPromise);
}

//////////////////////////////////////////////////////////
// Get a readerCharacteristic for a given car.
// If one doesn't exist, try to connect to the car first.
//////////////////////////////////////////////////////////
function getReaderCharacteristic(carName) {
  var getReaderPromise = new Promise(
    function(resolve, reject) {
      // If we already have the reader, return it
      for(var i=0; i<readerCharacteristicList.length;i++) {
        if(readerCharacteristicList[i].carName == carName) {
          console.log("found reader right away "+i);
          readerCharacteristic = readerCharacteristicList[i].characteristic;
          resolve(readerCharacteristic);
          return;
        }
      }

    // If we are here, there was no reader... we need to try and connect.
    console.log("Car not connected");
    connectCar(carName).then(function(res){
      console.log("In connectCar 'then'");
      for(var i=0; i<readerCharacteristicList.length;i++) {
        if(readerCharacteristicList[i].carName == carName) {
          console.log("found reader after connect "+i);
          readerCharacteristic = readerCharacteristicList[i].characteristic;
          resolve(readerCharacteristic);
          return;
        }
      }
      reject(readerCharacteristic);
      return;
    });
  });
  return(getReaderPromise);
}

//////////////////////////////////////////////////////////
// Get a writerCharacteristic for a given car.
// If one doesn't exist, try to connect to the car first.
//////////////////////////////////////////////////////////
function getWriterCharacteristic(carName) {
  var getWriterPromise = new Promise(
    function(resolve, reject) {
      // Try to get an existing writerCharacteristicList
      for(var i=0; i<writerCharacteristicList.length;i++) {
        if(writerCharacteristicList[i].carName == carName) {
          writerCharacteristic = writerCharacteristicList[i].characteristic;
          console.log("resolve writer without connect.");
          resolve(writerCharacteristic);
          return;
        }
      }
      // One must not exist, try once to create one.
      console.log("Car not connected");
      connectCar(carName).then(function(res){
        // Try again after connect.
        for(var i=0; i<writerCharacteristicList.length;i++) {
          if(writerCharacteristicList[i].carName == carName) {
            writerCharacteristic = writerCharacteristicList[i].characteristic;
            console.log("resolve writer with connect.");
            resolve(writerCharacteristic);
            return;
          }
        }
        reject("Unable to connect to car");
      });
  });
  return(getWriterPromise);
}

//define LIGHT_HEADLIGHTS    0
//define LIGHT_BRAKELIGHTS   1
//define LIGHT_FRONTLIGHTS   2
//define LIGHT_ENGINE        3
var setLights = function(carName,lightValue) {
  var lightMessage = new Buffer(3);
  lightMessage.writeUInt8(0x02, 0);
  lightMessage.writeUInt8(0x1d, 1); // ANKI_VEHICLE_MSG_C2V_SET_LIGHTS
  lightMessage.writeUInt8(lightValue, 2); // Bits 0-3 (mask.  Could always be F) Bits 4-7 (Head/Tail/Brake/???)
                                          // E.g. 0x44 ('set' 'headlights')

  console.log("set lights: Getting writer char");
  getWriterCharacteristic(carName).then(function(writerCharacteristic) {
    if(writerCharacteristic != null) {
      console.log("Turn on lights");
      writerCharacteristic.write(lightMessage, false, function(err) {
        if(err) {
          console.log("Error: "+util.inspect(err, false,null));
        } else {
          console.log("Set LightsSuccess");
        }
      });
    }
  });
}

// The lights API for ANKI seems to have changed for Overdrive.  The set lights still works, to some extent, but not used in the game.
// This 'Set Pattern' APi is used for all the lighting.  However, the API now uses 17bytes rather than 8.  I have not figured them
// all out.  I sorted out basic STEADY RGB; which was good enough for now.
//
// Set lights pattern
// Game: 0x15 0x00 0x04 0x00 0x52 0x0b 0x00 0x11 0x33 0x03 0x00 0x00 0x00 0x00 0x00 0x03 0x00 0x00 0x00 0x00 0x02 0x00 0x0e 0x0e 0x00 0xfc 0x01 0xa8 // Blue
// Game: 0x15 0x00 0x04 0x00 0x52 0x0b 0x00 0x11 0x33 0x03 0x00 0x00 0x0a 0x0a 0x00 0x03 0x00 0x00 0x00 0x00 0x02 0x00 0x00 0x00 0x00 0x7e 0x8c 0xc2 // Red
// Game: 0x15 0x00 0x04 0x00 0x52 0x0b 0x00 0x11 0x33 0x03 0x00 0x00 0x00 0x00 0x00 0x03 0x00 0x0a 0x0a 0x00 0x02 0x00 0x00 0x00 0x00 0x37 0x9a 0x07 // Green
// Game: 0x15 0x00 0x04 0x00 0x52 0x0b 0x00 0x11 0x33 0x03 0x00 0x00 0x0a 0x0a 0x00 0x03 0x00 0x00 0x00 0x00 0x02 0x00 0x0a 0x0a 0x00 0x68 0xd2 0x79 // Purple

// Brake Lights:(works)
// Game: 0x15 0x00 0x04 0x00 0x52 0x0b 0x00 0x11 0x33 0x01 0x01 0x00 0x0e 0x0e 0x00 0x08 0x00 0x00 0x00 0x81 0x51 0x7d 0x79 0xf4 0xeb 0x5a 0xd8 0xbe

var setEngineLight = function(carName,red,green,blue) {
// Old API - This does not work.
//  var lightsPatternMessage = new Buffer(8);
//  lightsPatternMessage.writeUInt8(0x07, 0);
//  lightsPatternMessage.writeUInt8(0x33, 1); // ANKI_VEHICLE_MSG_C2V_LIGHTS_PATTERN
//  lightsPatternMessage.writeUInt8(channel, 2); // channel (LIGHT_RED,LIGHT_GREEN,LIGHT_BLUE)
//  lightsPatternMessage.writeUInt8(effect, 3); // effect (effects: STEADY, FADE, THROB, FLASH, RANDOM)
//  lightsPatternMessage.writeUInt8(start, 4); // start
//  lightsPatternMessage.writeUInt8(end, 5); // end
//  lightsPatternMessage.writeUInt16BE(cycles, 6); // cycles_per_min

  // New API.
  var lightsPatternMessage = new Buffer(18);
  lightsPatternMessage.writeUInt8(0x11, 0); // Buffer Size
  lightsPatternMessage.writeUInt8(0x33, 1); // ANKI_VEHICLE_MSG_C2V_LIGHTS_PATTERN
  lightsPatternMessage.writeUInt8(0x03, 2);
  lightsPatternMessage.writeUInt8(0x00, 3);
  lightsPatternMessage.writeUInt8(0x00, 4);
  lightsPatternMessage.writeUInt8(red, 5); // Red Start?
  lightsPatternMessage.writeUInt8(red, 6); // Red End?
  lightsPatternMessage.writeUInt8(0x00, 7);
  lightsPatternMessage.writeUInt8(0x03, 8);
  lightsPatternMessage.writeUInt8(0x00, 9);
  lightsPatternMessage.writeUInt8(green,10); // Green Start?
  lightsPatternMessage.writeUInt8(green,11); // Green End?
  lightsPatternMessage.writeUInt8(0x00,12);
  lightsPatternMessage.writeUInt8(0x02,13); // 2=Solid. Anything else acts like Pulse
  lightsPatternMessage.writeUInt8(0x00,14);
  lightsPatternMessage.writeUInt8(blue,15); // Blue start? 
  lightsPatternMessage.writeUInt8(blue,16); // Blue End?
  lightsPatternMessage.writeUInt8(0x00,17);

  console.log("set engine lights: ",lightsPatternMessage);
  getWriterCharacteristic(carName).then(function(writerCharacteristic) {
      console.log("Turn on lights");
      writerCharacteristic.write(lightsPatternMessage, false, function(err) {
        if(err) {
          console.log("Error: "+util.inspect(err, false,null));
        } else {
          console.log("Set LightsSuccess");
        }
      });
  });
}

//////////////////////////////////////////////////////////
// Make car do a U-Turn
//////////////////////////////////////////////////////////
var uTurn = function(carName) {
  var uTurnMessage = new Buffer(2);
  uTurnMessage.writeUInt8(0x02, 0);
  uTurnMessage.writeUInt8(0x32, 1); // ANKI_VEHICLE_MSG_C2V_TURN_180

  getWriterCharacteristic(carName).then(function(writerCharacteristic) {
    if(writerCharacteristic != null) {
      console.log("U-Turn");
      writerCharacteristic.write(uTurnMessage, false, function(err) {
        if(err) {
          console.log("Error: "+util.inspect(err, false,null));
        } else {
          console.log("U-Turn Success");
        }
      });
    }
  });
}

//////////////////////////////////////////////////////////
// Set car speed
// 0x0a 0x00 0x04 0x00 0x12 0x0b 0x00 0x06 0x24 0x54 0x01 0xe8 0x03 0x00 0x3b 0xbc 0xa1
//////////////////////////////////////////////////////////
var setSpeed = function(carName,speed) {
  getWriterCharacteristic(carName).then(function(writerCharacteristic) {
    var speedMessage = new Buffer(7);
    speedMessage.writeUInt8(0x06, 0);
    speedMessage.writeUInt8(0x24, 1);
    speedMessage.writeInt16LE(speed, 2);
    speedMessage.writeInt16LE(1000, 4);

    writerCharacteristic.write(speedMessage, false, function(err) {
      if(err) {
        console.log("Error: "+util.inspect(err, false,null));
      } else {
        console.log("Set Speed Success");
      }
    });
  });
}

//////////////////////////////////////////////////////////
// Set car speed
//////////////////////////////////////////////////////////
var changeLanes = function(carName,change) {
  // To change lanes, we need to make two calls (Based on vehicle_cmd.c from sdk)
  // anki_vehicle_msg_set_offset_from_road_center
  // anki_vehicle_msg_change_lane

  // Step 1. anki_vehicle_msg_set_offset_from_road_center
  //
  getWriterCharacteristic(carName).then(function(writerCharacteristic) {
    var changeMessage = new Buffer(12);
    changeMessage.writeUInt8(11, 0); // ANKI_VEHICLE_MSG_C2V_CHANGE_LANE_SIZE
    changeMessage.writeUInt8(0x25, 1); // ANKI_VEHICLE_MSG_C2V_CHANGE_LANE
    changeMessage.writeInt16LE(250, 2); // horizontal_speed_mm_per_sec
    changeMessage.writeInt16LE(1000, 4); // horizontal_accel_mm_per_sec2
    changeMessage.writeFloatLE(parseFloat(change), 6); // offset_from_road_center_mm

    console.log("Sending lane change: "+change);
    writerCharacteristic.write(changeMessage, false, function(err) {
      if(err) {
        console.log("Error: "+util.inspect(err, false,null));
      } else {
        console.log("Success");
      }
    });
  });
}

//////////////////////////////////////////////////////////
// Get Battery Levels
//////////////////////////////////////////////////////////
var batteryLevel = function(carName) {
  var batteryPromise = new Promise(
    function(resolve, reject) {
      getReaderCharacteristic(carName).then(function(readerCharacteristic) {
        console.log("Starting parallel");
        async.parallel([
          function(callback) {  // Turn on reader notifications
            console.log("set notify true");
            readerCharacteristic.notify(true, function(err) {
            });
            callback();
          },
          function(callback) { // Read data until we get battery info
            console.log("setting up process data function");
            function processData(data, isNotification) {
              console.log("process data function called.");
              var messageId = data.readUInt8(1);
              if(messageId == 0x1b) { // ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE
                console.log("Found battery level msg.");
                var level = data.readUInt16LE(2);
                //messageParse.parse(data);
                replyData=level
                readerCharacteristic.removeListener('read',processData);
                callback();
              }
            }
            readerCharacteristic.on('read', processData);
          },
          function(callback) { // Write the request to get battery info
            console.log("running writer.");
            message = new Buffer(2);
            message.writeUInt8(0x01, 0);
            message.writeUInt8(0x1a, 1); // ANKI_VEHICLE_MSG_C2V_BATTERY_LEVEL_REQUEST
            getWriterCharacteristic(carName).then(function(writerCharacteristic) {
              writerCharacteristic.write(message, false, function(err) {
                if(err) {
                  console.log("Error: "+util.inspect(err, false,null));
                } else {
                  console.log("Request Battery Level Success");
                }
              });
              callback();
            });
          }],
          function(err) { /// Done... build reply
            console.log("Battery value: "+replyData);
            var finalLevel = Math.floor((replyData / MAX_BATTERY_LEVEL) * 100);
            resolve(finalLevel);
            return;
          }
        );
      });
    });
  return(batteryPromise);
}

//////////////////////////////////////////////////////////
// Ping / Response
//////////////////////////////////////////////////////////
var ping = function(carName) {
  var pingPromise = new Promise(
    function(resolve, reject) {
      getReaderCharacteristic(carName).then(function(readerCharacteristic) {
        async.parallel([
          function(callback) {  // Turn on reader notifications
            console.log("set notify true");
            readerCharacteristic.notify(true, function(err) {
            });
            callback();
          },
          function(callback) { // Read data until we get ping response
            console.log("setting up process data function");
            function processData(data, isNotification) {
              console.log("process data function called.");
              var messageId = data.readUInt8(1);
              if(messageId == 0x17) { // ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
                console.log("Found ping msg.");
                replyData="Success";
                readerCharacteristic.removeListener('read',processData);
                callback();
              }
            }
            readerCharacteristic.on('read', processData);
          },
          function(callback) { // Write the request to ping
            console.log("running writer.");
            message = new Buffer(2);
            message.writeUInt8(0x01, 0);
            message.writeUInt8(0x16, 1); // ANKI_VEHICLE_MSG_C2V_PING_REQUEST
            getWriterCharacteristic(carName).then(function(writerCharacteristic) {
              writerCharacteristic.write(message, false, function(err) {
                if(err) {
                  console.log("Error: "+util.inspect(err, false,null));
                } else {
                  console.log("Request Battery Level Success");
                }
              });
              callback();
            });
          }],
          function(err) { /// Done... build reply
            console.log("Ping Response: ",replyData);
            resolve(replyData);
            return;
          }
        );
      });
    });
  return(pingPromise);
}

//////////////////////////////////////////////////////////
// Track Count Travel.  Makes a car travel 'x' number of tracks, then stops.
//////////////////////////////////////////////////////////
var trackCountTravel = function(carName,tracksToTravel,speed) {
  getReaderCharacteristic(carName).then(function(readerCharacteristic){
    console.log("in then after getting a reader...");
    if(readerCharacteristic == null) {
      return("Unable to find and connect to car "+carName);
    }
    var replyData=null;
    var trackCount=0;

    console.log("Starting parallel");
    async.parallel([
      function(callback) {  // Turn on reader notifications
        readerCharacteristic.notify(true, function(err) {
        });
        callback();
      },
      function(callback) { // Read data until we get track msg
        console.log("Starting reader...");
        function processData(data, isNotification) {
          var messageId = data.readUInt8(1);
          if(messageId == '41') {  // Track event (This happens when the car transitions from one track to the next)
            trackCount = trackCount + 1;
            console.log("Track Count: "+trackCount+"/"+tracksToTravel);
            if(trackCount >= tracksToTravel) {
              // stop the car
              readerCharacteristic.removeListener('read',processData);
              callback();
            }
          }
        }
        readerCharacteristic.on('read', processData);
      },
      function(callback) { // Write the request to start the car traveling
        console.log("Starting car...");
        writerCharacteristic = getWriterCharacteristic(carName);
        setSpeed(carName,speed);
        callback();
      }],
      function(err) { /// Done... build reply
        console.log("Final call.  Stop car");
        console.log("Starting car...");
        writerCharacteristic = getWriterCharacteristic(carName);
        setSpeed(carName,0);
        disconnectCar(carName);
      }
    );
  });
}

var mapTrack = function(carName,trackMap) {
  console.log("Map Track Start...");
  trackMap.resetTrackMap();
  //rescan(); // try to make sure we can see the car
  getReaderCharacteristic(carName).then(function(readerCharacteristic){
    if(readerCharacteristic == null) {
      return("Unable to find and connect to car "+carName);
    }
    var replyData=null;
    var trackCount=0;
    var trackTransition=false;
    var startTrackCount=0;

    console.log("Starting parallel");
    async.parallel([
      function(callback) {  // Turn on reader notifications
        readerCharacteristic.notify(true, function(err) {
        });
        callback();
      },
      function(callback) { // Read data until we get track msg
        console.log("Starting reader...");
        function processData(data, isNotification) {
          var messageId = data.readUInt8(1);
          if(messageId == 0x27) { // ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE
            //console.log("Position Update...");
            if(trackTransition == true) {
              var trackLocation = data.readUInt8(2);
              var trackId = data.readUInt8(3);
              var offset = data.readFloatLE(4);
              var speed = data.readUInt16LE(8);
              var clockwise = false;
              if(data.readUInt8(10) == 0x47) {
                clockwise = true;
              }
              trackMap.addTrackToMap(trackId,clockwise);
              trackTransition = false;
              if(trackId == 33) { // Start track
                startTrackCount++;
                if(startTrackCount >= 2) {
                  // stop the car
                  readerCharacteristic.removeListener('read',processData);
                  callback();
                }
              }
            }
          } else if (messageId == 0x29) { // Track event (This happens when the car transitions from one track to the next
            console.log("Track Transition Event...");
            trackCount = trackCount + 1;
            trackTransition = true;
          }
        }
        readerCharacteristic.on('read', processData);
      },
      function(callback) { // Write the request to start the car traveling
        console.log("Starting car for mapping: "+carName);
        writerCharacteristic = getWriterCharacteristic(carName);
        setSpeed(carName,500);
        callback();
      }],
      function(err) { /// Done... build reply
        console.log("Final call.  Stop car.  Mapping done.");
        console.log("Starting car...");
        writerCharacteristic = getWriterCharacteristic(carName);
        setSpeed(carName,0);
      }
    );
  });
  console.log("Map Track End...");
}

module.exports = function() {
  return {
    rescan: rescan,
    connectCar: connectCar,
    disconnectCar: disconnectCar,
    turnOnSdkMode: turnOnSdkMode,
    setLaneOffset: setLaneOffset,
    setLights: setLights,
    setEngineLight: setEngineLight,
    setSpeed: setSpeed,
    turnOnLogging: turnOnLogging,
    changeLanes: changeLanes,
    uTurn: uTurn,
    ping: ping,
    batteryLevel: batteryLevel,
    trackCountTravel: trackCountTravel,
    mapTrack: mapTrack
  }
};
