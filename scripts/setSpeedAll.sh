#curl -X POST http://localhost:7877/setSpeed/Thermo/${1}
#curl -X POST http://localhost:7877/setSpeed/Ground%20Shock/${1}
#curl -X POST http://localhost:7877/setSpeed/Skull/${1}
#curl -X POST http://localhost:7877/setSpeed/Guardian/${1}

for i in `./getDeviceAddresses.sh`; do
  echo $i
  echo "Command: curl -X POST http://localhost:7877/$i/${1}"
  curl -X POST http://localhost:7877/setSpeed/$i/${1}
done
