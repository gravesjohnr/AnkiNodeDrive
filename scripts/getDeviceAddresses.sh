curl -s -X GET http://localhost:7877/getDevices | jq -r '.carList[].address'
