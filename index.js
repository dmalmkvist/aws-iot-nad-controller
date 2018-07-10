#!/usr/bin/env node
require('rconsole')
const CmdParser = require('./src/cmd-parser');
const IotShadow = require('./src/iot-shadow');
const Controller = require('./src/controller');

process.on('SIGINT', quit);
process.on('SIGTERM', quit);

console.set({
  facility: 'local0',
  title: 'nad-controller',
  showLine: false});

let cmdParser = new CmdParser(process.argv.slice(2));

function init(callback) {
  let iotShadow = new IotShadow(cmdParser);

  iotShadow.connect(function() {
    console.log('Connected to shadow');
    let controller = new Controller(iotShadow);

    controller.on('failure', (error) => console.log('ERROR: ' + error));
    controller.connect(callback);
  })
}


function start() {
  init((error) => {
    if (error) {
      console.log(error);
      setTimeout(start, 1000);
      return;
    }

    console.log('Controller up and running!')

  });
}

function quit(signal) {
  console.log(`Received ${signal}, exiting`);
  process.exit(0);
}

console.log('Starting nad-controller');
try {
  start();
} catch(error) {
  console.log('Failed to start: ' + error);
}
