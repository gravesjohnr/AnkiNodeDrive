var trackShape=new Array(1);
trackShape[0]=new Array(1);

var startFound=false;
var mapX=0;
var mapY=0;
var mapDir=0;
var trackMapDone=false;

function updateTrackShape() {
  if(mapX < 0) {
    for(var i=0;i<trackShape.length;i++) {
      trackShape[i].unshift( 0 );
    }
    mapX = 0;
  }
  if(mapY < 0) {
    var newRow = new Array(trackShape[0].length);
    for(var i=0;i<trackShape[0].length;i++) {
      newRow[i] = 0;
    }
    trackShape.unshift( newRow );
    mapY = 0;
  }
  if(trackShape.length <= mapY) {
    var newRow = new Array(trackShape[0].length);
    for(var i=0;i<trackShape[0].length;i++) {
      newRow[i] = 0;
    }
    trackShape.push( newRow );
  }
  if(trackShape[mapY].length <= mapX) {
    for(var i=0;i<trackShape.length;i++) {
      trackShape[i].push( 0 );
    }
  }
}

// Building a track array:
// 0 - No track
// 1 - Start/Finish 
// 2 - Straight Horizontal
// 3 - Straight Vertical
// 4 - Curve - North -> East (West -> South)
// 5 - Curve - East -> South (North -> West)
// 6 - Curve - West -> North (South -> East)
// 7 - Curve - South -> West (East -> North)
// 8 - Straight Horizontal over Vertical
// 9 - Straight Vertical over Horizontal
//10 - Two Curve - West -> North AND East -> South
//11 - Two Curve - South -> West AND North -> East
//12 - Curve - North -> East over Vertical
//13 - Curve - North -> West over Vertical
//14 - Curve - South -> East over Vertical
//15 - Curve - South -> West over Vertical
//16 - Curve - North -> East over Horizontal
//17 - Curve - North -> West over Horizontal
//18 - Curve - South -> East over Horizontal
//19 - Curve - South -> West over Horizontal
//20 - Crossover - No change in direction
//21 - Two Curve - West -> North AND North -> East
//22 - Two Curve - South -> West AND East -> South
//23 - Two Curve - East -> South AND North -> East
//24 - Two Curve - South -> West AND West -> North
// I just don't deal with straight over curve...
var addTrackToMap = function(trackId,clockwise) {
  var trackTypes=["unknown","unknown","unknown","unknown","unknown","unknown","unknown","unknown","unknown","unknown", //  0- 9
                  "Crossover","Turn",   "unknown","unknown","unknown","unknown","unknown","Turn",   "Turn",   "unknown", // 10-19
                  "Turn",   "unknown","unknown","Turn",   "unknown","unknown","unknown","unknown","unknown","unknown", // 20-29
                  "unknown","unknown","unknown","Start",  "Finish", "unknown","Straight","unknown","unknown","Straight", // 30-39
                  "Straight","unknown","unknown","Straight","unknown","unknown","Straight","unknown","unknown","unknown"] // 40-49
  var trackType = trackTypes[trackId];
  if (trackType == "Start") {
    if(startFound == true) { // We've already done the whole map.
      trackMapDone=true;
    }
    startFound = true;
    trackShape[mapY][mapX]=1;
    mapDir=1; // East
    mapX += 1;
    updateTrackShape();
  }

  if(startFound == false) {
    return;
  }

  console.log("Found track type["+trackId+"]: "+trackType);
  if (trackType == "Straight") {
      if(mapDir == 1) { // East
        switch(trackShape[mapY][mapX]) {
          case 0:
            trackShape[mapY][mapX]=2;
            break;
          case 3:
            trackShape[mapY][mapX]=8;
            break;
          case 4:
            trackShape[mapY][mapX]=16;
            break;
          case 5:
            trackShape[mapY][mapX]=17;
            break;
          case 6:
            trackShape[mapY][mapX]=18;
            break;
          case 7:
            trackShape[mapY][mapX]=19;
            break;
          default:
            break; // Leave it alone if something is there.
        }
        mapX += 1;
        updateTrackShape();
      }
      else if(mapDir == 2) { // South
        switch(trackShape[mapY][mapX]) {
          case 0:
            trackShape[mapY][mapX]=3;
            break;
          case 4:
            trackShape[mapY][mapX]=12;
            break;
          case 5:
            trackShape[mapY][mapX]=13;
            break;
          case 6:
            trackShape[mapY][mapX]=14;
            break;
          case 7:
            trackShape[mapY][mapX]=15;
            break;
          case 2:
            trackShape[mapY][mapX]=9;
            break;
          default:
            break; // Leave it alone if something is there.
        }
        mapY += 1;
        updateTrackShape();
      }
      else if(mapDir == 3) { // West
        switch(trackShape[mapY][mapX]) {
          case 0:
            trackShape[mapY][mapX]=2;
            break;
          case 3:
            trackShape[mapY][mapX]=8; // Horz over Vert
            break;
          case 4:
            trackShape[mapY][mapX]=16;
            break;
          case 5:
            trackShape[mapY][mapX]=17;
            break;
          case 6:
            trackShape[mapY][mapX]=18;
            break;
          case 7:
            trackShape[mapY][mapX]=19;
            break;
          default:
            break; // Leave it alone if something is there.
        }
        mapX -= 1;
        updateTrackShape();
      }
      else if(mapDir == 0) { // North
        switch(trackShape[mapY][mapX]) {
          case 0:
            trackShape[mapY][mapX]=3;
            break;
          case 4:
            trackShape[mapY][mapX]=12;
            break;
          case 5:
            trackShape[mapY][mapX]=13;
            break;
          case 6:
            trackShape[mapY][mapX]=14;
            break;
          case 7:
            trackShape[mapY][mapX]=15;
            break;
          case 2:
            trackShape[mapY][mapX]=9;
            break;
          default:
            break; // Leave it alone if something is there.
        }
        mapY -= 1;
        updateTrackShape();
      }
  }
  if (trackType == "Turn") {
    if(clockwise) {
      trackType = "Right Turn";
        if(mapDir == 1) { // East
          switch(trackShape[mapY][mapX]) {
            case 0: // Nothing there.
              trackShape[mapY][mapX]=5;
              break;
            case 2: // Over horiz
              trackShape[mapY][mapX]=17;
              break;
            case 3: // Over vert
              trackShape[mapY][mapX]=13;
              break;
            case 4: // Over corner turn
              trackShape[mapY][mapX]=22;
              break;
            case 6: // Over corner turn
              trackShape[mapY][mapX]=11;
              break;
            case 7: // Over corner turn
              trackShape[mapY][mapX]=24;
              break;
            default: // Don't touch
              break;
          }
          mapDir = 2; // South
          mapY += 1;
          updateTrackShape();
        }
        else if(mapDir == 2) { // South
          switch(trackShape[mapY][mapX]) {
            case 0:
              trackShape[mapY][mapX]=7;
              break;
            case 2:
              trackShape[mapY][mapX]=19;
              break;
            case 3:
              trackShape[mapY][mapX]=15;
              break;
            case 4:
              trackShape[mapY][mapX]=10;
              break;
            case 5:
              trackShape[mapY][mapX]=24;
              break;
            case 6:
              trackShape[mapY][mapX]=21;
              break;
            default:
              break;
          }
          mapDir = 3; // West
          mapX -= 1;
          updateTrackShape();
        }
        else if(mapDir == 3) { // West
          switch(trackShape[mapY][mapX]) {
            case 0:
              trackShape[mapY][mapX]=6;
              break;
            case 2:
              trackShape[mapY][mapX]=18;
              break;
            case 3:
              trackShape[mapY][mapX]=14;
              break;
            case 4:
              trackShape[mapY][mapX]=23;
              break;
            case 5:
              trackShape[mapY][mapX]=11;
              break;
            case 7:
              trackShape[mapY][mapX]=21;
              break;
            default:
              break;
          }
          mapDir = 0; // North
          mapY -= 1;
          updateTrackShape();
        }
        else if(mapDir == 0) { // North
          switch(trackShape[mapY][mapX]) {
            case 0:
              trackShape[mapY][mapX]=4;
              break;
            case 2:
              trackShape[mapY][mapX]=16;
              break;
            case 3:
              trackShape[mapY][mapX]=12;
              break;
            case 5:
              trackShape[mapY][mapX]=22;
              break;
            case 6:
              trackShape[mapY][mapX]=23;
              break;
            case 7:
              trackShape[mapY][mapX]=10;
              break;
            default:
              break;
          }
          mapDir = 1; // East
          mapX += 1;
          updateTrackShape();
        }
    } else {
      trackType = "Left Turn";
        if(mapDir == 1) { // East
          switch(trackShape[mapY][mapX]) {
            case 0:
              trackShape[mapY][mapX]=7;
              break;
            case 2:
              trackShape[mapY][mapX]=19;
              break;
            case 3:
              trackShape[mapY][mapX]=15;
              break;
            case 5:
              trackShape[mapY][mapX]=24;
              break;
            case 6:
              trackShape[mapY][mapX]=21;
              break;
            case 7:
              trackShape[mapY][mapX]=10;
              break;
            default:
              break;
          }
          mapDir = 0; // North
          mapY -= 1;
          updateTrackShape();
        }
        else if(mapDir == 2) { // South
          switch(trackShape[mapY][mapX]) {
            case 0:
              trackShape[mapY][mapX]=6;
              break;
            case 2:
              trackShape[mapY][mapX]=18;
              break;
            case 3:
              trackShape[mapY][mapX]=14;
              break;
            case 4:
              trackShape[mapY][mapX]=23;
              break;
            case 5:
              trackShape[mapY][mapX]=11;
              break;
            case 7:
              trackShape[mapY][mapX]=21;
              break;
            default:
              break;
          }
          mapDir = 1; // East
          mapX += 1;
          updateTrackShape();
        }
        else if(mapDir == 3) { // West
          switch(trackShape[mapY][mapX]) {
            case 0:
              trackShape[mapY][mapX]=4;
              break;
            case 2:
              trackShape[mapY][mapX]=16;
              break;
            case 3:
              trackShape[mapY][mapX]=12;
              break;
            case 5:
              trackShape[mapY][mapX]=22;
              break;
            case 6:
              trackShape[mapY][mapX]=23;
              break;
            case 7:
              trackShape[mapY][mapX]=10;
              break;
            default:
              break;
          }
          mapDir = 2; // South
          mapY += 1;
          updateTrackShape();
        }
        else if(mapDir == 0) { // North
          switch(trackShape[mapY][mapX]) {
            case 0:
              trackShape[mapY][mapX]=5;
              break;
            case 2:
              trackShape[mapY][mapX]=17;
              break;
            case 3:
              trackShape[mapY][mapX]=13;
              break;
            case 4:
              trackShape[mapY][mapX]=22;
              break;
            case 6:
              trackShape[mapY][mapX]=11;
              break;
            case 7:
              trackShape[mapY][mapX]=24;
              break;
            default:
              break;
          }
          mapDir = 3; // West
          mapX -= 1;
          updateTrackShape();
        }
      }
  }
  if (trackType == "Crossover") {
    switch(trackShape[mapY][mapX]) {
      case 0:
        trackShape[mapY][mapX]=20;
        break;
      default:
        break; // Leave it alone if something is there.
      }

      if(mapDir == 1) { // East
        mapX += 1;
      }
      else if(mapDir == 2) { // South
        mapY += 1;
      }
      else if(mapDir == 3) { // West
        mapX -= 1;
      }
      else if(mapDir == 0) { // North
        mapY -= 1;
      }
      updateTrackShape();
  }
  if (trackType == "unknown") {
    console.log("Unknown type: ",trackId);
  }
  console.log("New Track Shape: ",trackShape);
}

var isTrackMapDone = function() {
  return trackMapDone;
}

var setTrackMapDone = function() {
  trackMapDone=true;
}

var resetTrackMap = function() {
  trackMapDone=false;
  startFound=false;
  mapX=0;
  mapY=0;
  mapDir=0;
  trackShape=new Array(1);
  trackShape[0]=new Array(1);
}

var getTrackMapData = function() {
  return trackShape;
}

var setTrackMapData = function(newMap) {
  trackShape=newMap;
}

var getTrackMap = function(size) {
  var Canvas = require('canvas');
  var Image = Canvas.Image;

  var segmentImages = new Array(25);
  segmentImages[0] = new Image; segmentImages[0].src = "images/"+size+"/0.png";
  segmentImages[1] = new Image; segmentImages[1].src = "images/"+size+"/1.png";
  segmentImages[2] = new Image; segmentImages[2].src = "images/"+size+"/2.png";
  segmentImages[3] = new Image; segmentImages[3].src = "images/"+size+"/3.png";
  segmentImages[4] = new Image; segmentImages[4].src = "images/"+size+"/4.png";
  segmentImages[5] = new Image; segmentImages[5].src = "images/"+size+"/5.png";
  segmentImages[6] = new Image; segmentImages[6].src = "images/"+size+"/6.png";
  segmentImages[7] = new Image; segmentImages[7].src = "images/"+size+"/7.png";
  segmentImages[8] = new Image; segmentImages[8].src = "images/"+size+"/8.png";
  segmentImages[9] = new Image; segmentImages[9].src = "images/"+size+"/9.png";
  segmentImages[10] = new Image; segmentImages[10].src = "images/"+size+"/10.png";
  segmentImages[11] = new Image; segmentImages[11].src = "images/"+size+"/11.png";
  segmentImages[12] = new Image; segmentImages[12].src = "images/"+size+"/12.png";
  segmentImages[13] = new Image; segmentImages[13].src = "images/"+size+"/13.png";
  segmentImages[14] = new Image; segmentImages[14].src = "images/"+size+"/14.png";
  segmentImages[15] = new Image; segmentImages[15].src = "images/"+size+"/15.png";
  segmentImages[16] = new Image; segmentImages[16].src = "images/"+size+"/16.png";
  segmentImages[17] = new Image; segmentImages[17].src = "images/"+size+"/17.png";
  segmentImages[18] = new Image; segmentImages[18].src = "images/"+size+"/18.png";
  segmentImages[19] = new Image; segmentImages[19].src = "images/"+size+"/19.png";
  segmentImages[20] = new Image; segmentImages[20].src = "images/"+size+"/20.png";
  segmentImages[21] = new Image; segmentImages[21].src = "images/"+size+"/21.png";
  segmentImages[22] = new Image; segmentImages[22].src = "images/"+size+"/22.png";
  segmentImages[23] = new Image; segmentImages[23].src = "images/"+size+"/23.png";
  segmentImages[24] = new Image; segmentImages[24].src = "images/"+size+"/24.png";

  var segmentSize=0;
  if(size == 'small') { segmentSize=64; }
  if(size == 'medium') { segmentSize=128; }
  if(size == 'large') { segmentSize=256; }

  var imgSizeY = trackShape.length*segmentSize;
  var imgSizeX = trackShape[0].length*segmentSize;

  var canvas = new Canvas(imgSizeX,imgSizeY);
  var ctx = canvas.getContext('2d');
  for(var x=0;x<trackShape[0].length;x++) {
    for(var y=0;y<trackShape.length;y++) {
      ctx.drawImage(segmentImages[trackShape[y][x]],x*segmentSize,y*segmentSize)
    }
  }
  return(canvas);
}

module.exports = function() {
return {
    addTrackToMap: addTrackToMap,
    isTrackMapDone: isTrackMapDone,
    setTrackMapDone: setTrackMapDone,
    resetTrackMap: resetTrackMap,
    getTrackMapData: getTrackMapData,
    setTrackMapData: setTrackMapData,
    getTrackMap: getTrackMap
  }
};
