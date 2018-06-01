#!/usr/bin/env node
const CmdParser = require('./src/cmd-parser');
const IotShadow = require('./src/iot-shadow');
const Controller = require('./src/controller');

console.log('creating cmd parser')
let cmdParser = new CmdParser(process.argv.slice(2));
console.log('creating iotShadow')
let iotShadow = new IotShadow(cmdParser);

iotShadow.connect(function() {
  console.log('Connected to shadow');
  let controller = new Controller(iotShadow);
  controller.on('failure', (error) => console.log('ERROR: ' + error));
  controller.on('delta', (data) => console.log('DELTA: ', data));
  controller.on('state-change', (data) => console.log('STATE: ', data));
  controller.on('device-change', (data) => console.log('DEVICE: ', data));

  controller.connect((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    console.log('Controller up and running!')
  });
})

