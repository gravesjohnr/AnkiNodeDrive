#curl -X POST http://localhost:7877/connect/Thermo
#curl -X POST http://localhost:7877/connect/Ground%20Shock
#curl -X POST http://localhost:7877/connect/Skull
#curl -X POST http://localhost:7877/connect/Guardian

for i in `./getDeviceAddresses.sh`; do
  echo $i
  curl -X POST http://localhost:7877/connect/$i
done
