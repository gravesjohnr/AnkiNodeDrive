#!/bin/bash

numberRunning=`ps -ef | grep \/home\/pi\/ankiNodeDrive\/server.js | grep -v checkAndRestartANDServer.sh | grep -v grep | wc -l`

if [ $numberRunning -lt 1 ]; then
  export NODE_PATH=/usr/local/lib/node_modules
  /bin/date >> /home/pi/ankiNodeDrive.log
#  cd /home/pi/ankiNodeDrive;/usr/local/bin/node /home/pi/ankiNodeDrive/server.js >> /home/pi/ankiNodeDrive.log&
  cd /home/pi/ankiNodeDrive;sudo /home/pi/ankiNodeDrive/run.sh >> /home/pi/ankiNodeDrive.log&
fi
