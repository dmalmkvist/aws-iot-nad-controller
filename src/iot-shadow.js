const EventEmitter = require('events');
const awsIot = require('aws-iot-device-sdk');

module.exports = class IoTShadow extends EventEmitter {

  constructor(cmdParser) {
    super();
    this._callbacks = {};
    this._cmdParser = cmdParser;
    this._thingShadow = awsIot.thingShadow({
      keyPath: this._cmdParser.privateKey,
      certPath: this._cmdParser.clientCert,
      caPath: this._cmdParser.caCert,
      clientId: this._cmdParser.clientId,
      // region: args.region,
      //baseReconnectTimeMs: args.baseReconnectTimeMs,
      //keepalive: args.keepAlive,
      protocol: 'mqtts',
      //port: args.Port,
      host: this._cmdParser.host,
      debug: this._cmdParser.debug
    });

    this._thingShadow.on('timeout', this.onTimeout.bind(this));
    this._thingShadow.on('status', this.onStatus.bind(this));
    this._thingShadow.on('delta', this.onDelta.bind(this));
    this._thingShadow.on('rejected', this.onRejected.bind(this));
    this._thingShadow.on('error', this.onError.bind(this));

  }

  connect(callback) {

    this._thingShadow.register(this._cmdParser.thingName, {
      persistentSubscribe: true
    }, callback);
  }

  disconnect() {
    this._thingShadow.unregister(this._cmdParser.thingName);
  }

  getDesiredState(callback) {
    let clientToken = this._thingShadow.get(this._cmdParser.thingName);
    if (callback) {
      this._callbacks[clientToken] = callback;
    }
  }

  updateReportedState(state, callback) {
    let stateObject = {
      state: {
        reported: state
      }
    };
    let clientToken = this._thingShadow.update(this._cmdParser.thingName, stateObject);
    if (callback) {
      this._callbacks[clientToken] = callback;
    }
  }

  updateDesiredState(state, callback) {
    let stateObject = {
      state: {
        desired: state
      }
    };
    let clientToken = this._thingShadow.update(this._cmdParser.thingName, stateObject);
    if (callback) {
      this._callbacks[clientToken] = callback;
    }
  }

  onRejected(error) {
    this.emit('rejected', error);
  }

  onError(error) {
    this.emit('error', error);
  }

  onDelta(thingName, stateObject) {
    this.emit('delta', stateObject.state);
  }

  onTimeout(thingName, clientToken) {

    let callback = this._callbacks[clientToken];
    if (!callback) {
      this.onError('No callback found for token: ' + clientToken);
      return;
    }

    delete this._callbacks[clientToken];
    callback('Request timed-out');
  }

  onStatus(thingName, status, clientToken, stateObject) {
    let callback = this._callbacks[clientToken];
    if (!callback) {
      this.onError('No callback found for token: ' + clientToken + ', status:' + status);
      return;
    }
    delete this._callbacks[clientToken];

    if (status === 'rejected') {

      callback(stateObject.message);
    } else {

      callback(null, stateObject);
    }
  }
}
