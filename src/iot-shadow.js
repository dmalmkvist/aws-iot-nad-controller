const awsIot = require('aws-iot-device-sdk');

module.exports = class IoTShadow {

  constructor(cmdParser) {
    this.cmdParser = cmdParser;
    console.log('creating thing shadow')
    console.log('host: ' + this.cmdParser.host);
    this.thingShadow = awsIot.thingShadow({
      keyPath: this.cmdParser.privateKey,
      certPath: this.cmdParser.clientCert,
      caPath: this.cmdParser.caCert,
      clientId: this.cmdParser.clientId,
      // region: args.region,
      //baseReconnectTimeMs: args.baseReconnectTimeMs,
      //keepalive: args.keepAlive,
      protocol: 'mqtts',
      //port: args.Port,
      host: this.cmdParser.host,
      debug: this.cmdParser.debug
    });
  }

  connect(callback) {

    console.log('connecting')

    this.thingShadow.register(this.cmdParser.thingName, {
      persistentSubscribe: true
    }, callback);
  }

  disconnect() {
    this.thingShadow.unregister(this.cmdParser.thingName);
  }
}