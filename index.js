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
  controller.connect((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    console.log('Controller up and running!')
  });
})

