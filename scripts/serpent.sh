while [ 1 ]; do
  for i in `./getDeviceAddresses.sh`; do
    echo $i
    echo "Command: curl -X POST http://localhost:7877/changeLanes/$i/-68"
    #curl -X POST http://localhost:7877/changeLanes/$i/-68
  done
  sleep 2
  for i in `./getDeviceAddresses.sh`; do
    echo $i
    echo "Command: curl -X POST http://localhost:7877/changeLanes/$i/68"
    #curl -X POST http://localhost:7877/changeLanes/$i/68
  done
  sleep 2
done
