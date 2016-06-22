var trackMap = require('./trackMap.js')();

var trackTransition=false;

module.exports = function() {
  return {
    "parse" : function(data) {    
      var msgId = data.readUInt8(1);

      if (msgId == 0x17) { // ANKI_VEHICLE_MSG_V2C_PING_RESPONSE
        console.log("Message[0x"+msgId.toString(16)+"][Ping Response]: ",data);
      }

      else if (msgId == 0x19) { // ANKI_VEHICLE_MSG_V2C_VERSION_RESPONSE
        var version = data.readUInt16LE(2);
        console.log("Message["+msgId.toString(16)+"][Version]: "+version.toString(16));
      }

      else if (msgId == 0x1b) { // ANKI_VEHICLE_MSG_V2C_BATTERY_LEVEL_RESPONSE
        var level = data.readUInt16LE(2);
        var MAX_BATTERY_LEVEL=3800 // This is assumed from experience.
        console.log("Message[0x"+msgId.toString16+"][Battery Level]: "+Math.floor((level / MAX_BATTERY_LEVEL) * 100)+"%");
      }

      // Lights
      else if (msgId == 0x1d) { // ANKI_VEHICLE_MSG_C2V_SET_LIGHTS
      }

      // Driving Commands
      else if (msgId == 0x24) { // ANKI_VEHICLE_MSG_C2V_SET_SPEED
      }

      else if (msgId == 0x25) { // ANKI_VEHICLE_MSG_C2V_CHANGE_LANE
      }

      else if (msgId == 0x26) { // ANKI_VEHICLE_MSG_C2V_CANCEL_LANE_CHANGE
      }

      else if (msgId == 0x32) { // ANKI_VEHICLE_MSG_C2V_TURN_180
      }

      else if (msgId == 0x2c) { // ANKI_VEHICLE_MSG_C2V_SET_OFFSET_FROM_ROAD_CENTER
      }

      // Vehicle position notifications
      //     uint8_t     size;
      // uint8_t     msg_id;
      // uint8_t     _reserved[2];
      // float       offset_from_road_center_mm;
      // uint16_t    speed_mm_per_sec;
      // uint8_t     is_clockwise;

      else if (msgId == 0x27) { // ANKI_VEHICLE_MSG_V2C_LOCALIZATION_POSITION_UPDATE
        //              0         1         2         3         4         5         6         7         8         9
        //
        // The jump kit and landing are Jump(43) and Landing(46).  For mapping purposes, they are set to 'Straight'
        var trackLocation = data.readUInt8(2);
        var trackId = data.readUInt8(3);
        var offset = data.readFloatLE(4);
        var speed = data.readUInt16LE(8);
        var clockwise = false;
        if(data.readUInt8(10) == 0x47) {
          clockwise = true;
        }
        trackMap.addTrackToMap(trackId,clockwise);
//        console.log("Message[0x"+msgId.toString(16)+"][Position Update]: ",data," Location: ",trackLocation.toString(16)," id:(",trackId,") ",trackId.toString(16)," offset: ",offset," speed: "+speed+" clockwise: ",clockwise," Type: "+trackType);
        console.log("Message[0x"+msgId.toString(16)+"][Position Update]: ",data," Location: ",trackLocation.toString(16)," id:(",trackId,") ",trackId.toString(16)," offset: ",offset," speed: "+speed+" clockwise: ",clockwise);
       
      }

      // Message[0x29][Track Event]:  <Buffer 12 29 00 00 10 bf 1f 49 00 ff ff 00 00 54 01 00 00 37 36>
      // It looks like this event has changed from the SDK.  After much trial/error, I found an interesting bit of info from the message to help me figure out the shape of the track.
      else if (msgId == 0x29) { // ANKI_VEHICLE_MSG_V2C_LOCALIZATION_TRANSITION_UPDATE
        console.log("Message[0x"+msgId.toString(16)+"][Track Event]: ",data);
        console.log("Size: "+data.length);
        if(data.length < 18) {
          return; // Sometimes we get an odd msg.
        }
        trackTransition=true;
        var leftWheelDistance = data.readUInt8(17);
        var rightWheelDistance = data.readUInt8(18);
        trackStyle=""
        if (leftWheelDistance == rightWheelDistance) { trackStyle="Straight"; }
        else if (leftWheelDistance == (rightWheelDistance+1)) { trackStyle="Straight"; }
        else if (leftWheelDistance == (rightWheelDistance-1)) { trackStyle="Straight"; }
        else if (leftWheelDistance == (rightWheelDistance+2)) { trackStyle="Straight"; }
        else if (leftWheelDistance == (rightWheelDistance-2)) { trackStyle="Straight"; }
        else if (leftWheelDistance > rightWheelDistance) { trackStyle="Right Turn"; }
        else if (leftWheelDistance < rightWheelDistance) { trackStyle="Left Turn"; }

        // There is a shorter segment for the starting line track.
        crossedStartingLine = "";
        if ((leftWheelDistance < 0x25) && (leftWheelDistance > 0x19) && (rightWheelDistance < 0x25) && (rightWheelDistance > 0x19)) {
          crossedStartingLine = " (Crossed Starting Line)";
        }

        console.log("Message[0x"+msgId.toString(16)+"][Track Event]: ",data,"Left/Right Wheel Distances: "+leftWheelDistance+"/"+rightWheelDistance+" "+trackStyle+crossedStartingLine);
      }

      else if (msgId == 0x2b) { // ANKI_VEHICLE_MSG_V2C_VEHICLE_DELOCALIZED
        console.log("Message[0x"+msgId.toString(16)+"][Vehicle Delocalized]: ",data);
      }

      else if (msgId == 0x2d) { // ANKI_VEHICLE_MSG_V2C_OFFSET_FROM_ROAD_CENTER_UPDATE
        console.log("Message[0x"+msgId.toString(16)+"][Offset From Road Center Update]: ",data);
      }

      else if (msgId == 0x41) {
        console.log("Message[0x"+msgId.toString(16)+"][???]: ",data);
      }

      else {
        console.log("Message[0x"+msgId.toString(16)+"][???]: ",data);
      }
  }
  };
};
