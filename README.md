# AnkiNodeDrive
Anki Overdrive SDK using Node and BTLE</br>
<br/>
This emulates much of what can be found in the default Anki Drive SDK:<br/>
<a href='http://developer.anki.com/drive-sdk/'>http://developer.anki.com/drive-sdk/</a>
<br/>
This example shows similar capabilities using NodeJS.<br/>
<br/>
Full documentation can be found in the apidoc/index.html; which is automatically served by the nodeJS server at '/'.<br/>
<h2>Running</h2>
There is a run.sh to show how to run the server using a specific BLTE device.  I run this on a PI3 with built-in BLTE.  If you only have one BLTE device, node server.js should be enough.  You will likely need to do an npm install first to gather any dependencies.
<h2>Basic capabilities</h2>
See the apidoc for full api documentation.  Here is a basic list of capabilities:<br/>
<b>COMMUNICATIONS</b><br/>
- batteryLevel<br/>
- connect<br/>
- disconnect<br/>
- getDevices<br/>
- ping<br/>
- rescan<br/>
- turnOnLogging<br/>
<b>DRIVE</b><br/>
- changeLanes<br/>
- setLaneOffset<br/>
- setSpeed<br/>
- trackCountTravel<br/>
<b>LIGHTS</b><br/>
- flashTaillights<br/>
- setEngineLight<br/>
- turnOffHeadlights<br/>
- turnOffTaillights<br/>
- turnOnHeadlights<br/>
- turnOnTaillights<br/>
<br/>
<h2>Known Limitations</h2>
I was only able to sort out the track IDs for my kit.  I have a few other kits on order and will update the track IDs as best I can.  Please let me know if you are able to tell me additional track IDs and what type of track it is (straight/curve/start).<br/>
<br/>
The lights APIs were not easy to figure out.  I believe they changed quite a bit in the Overdrive version and the public SDK does not address the changes yet.  I did my best to handle a few cases.  If you sort out others, let me know.<br/>
<br/>
I began to work on being able to build a map of the track, but this is not yet complete.  My thinking was to expose two services:<br/>
/mapTrack/:carname - This would drive the given car at a slow pace (300) and capture each track ID from start to finish building a track map array.<br/>
/getMap - Get the resulting map array which could be used to generate an image.<br/>
/getMapImage - Perhaps auto generate a png/gif of the track. TBD<br/>
