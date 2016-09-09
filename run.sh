#!/bin/bash
btleUsbDevice=`hciconfig |grep Type | grep USB | awk -F ":" '{print $1}'`
if [ ${#btleUsbDevice} == 0 ]; then
  echo "No USB BTLE Device.  Using default onboard."
  export NOBLE_HCI_DEVICE_ID=0
else
  echo "USB BTLE Device Found."
  deviceId=${btleUsbDevice:3}
  export NOBLE_HCI_DEVICE_ID=${deviceId}
fi
echo "Id Used: $NOBLE_HCI_DEVICE_ID"
export NODE_PATH=/usr/local/lib/node_modules
while [ 1 ]
do
/usr/local/bin/node /home/pi/ankiNodeDrive/server.js
done
