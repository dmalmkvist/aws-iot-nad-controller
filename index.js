const CmdParser = require('./src/cmd-parser');
const IotShadow = require('./src/iot-shadow');

console.log('creating cmd parser')
let cmdParser = new CmdParser(process.argv.slice(2));
console.log('creating iotShadow')
let iotShadow = new IotShadow(cmdParser);

iotShadow.connect(function() {
  console.log('Connected to shadow');
  iotShadow.disconnect();
})

