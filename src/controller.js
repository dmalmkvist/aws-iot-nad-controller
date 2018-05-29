// const NadController = require('nad-controller');
const DeviceState = require('./device-state');
module.exports = class Controller {


  constructor(iotShadow) {
    this._iotShadow = iotShadow;

    this._deviceState = new DeviceState({});
    //this._nadController = new NadController('/dev/ttyUSB0', '../config/nad-c355.json');

    this.initialize(() => {
      console.log('initialize complete', JSON.stringify(this._deviceState.getState()));
      this.flipper();
      // this._iotShadow.on('delta', this.onDelta.bind(this));
    });
  }

  flipper() {
    setTimeout(function(that) {
      that.flip();
      that.flipper();
    }, 5000, this);
  }

  flip() {
    console.log('flip deviceState: ', this._deviceState.getState());
    let muteChange = this._deviceState.getState()['Main.Mute'] === 'On'? 'Off' : 'On';
    this.onDeviceChange({
      "name":"Main.Mute",
      "value": muteChange,
      "physicalTrigger":true
    });
  }

  initialize(callback) {

    // Get real device state
    this._deviceState = new DeviceState({
      "Main.Power": "Off",
      "Main.Mute": "Off",
      "Main.Source": "Video"
    });

    this._deviceState.on('update', this.onStateChanged.bind(this));
    this._iotShadow.on('delta', this.onDelta.bind(this));

    this._iotShadow.updateReportedState(this._deviceState.getState(), (error, update) => console.log('init state reported', JSON.stringify(update)));
    callback();
  }

  onStateChanged(update) {
    console.log('onLocalChange: ', update);
    if (Object.keys(update).length === 0) {
      return;
    }

    this._iotShadow.updateReportedState(update, () => console.log('state reported', JSON.stringify(update)));
  }

  onDelta(state) {

    console.log('onDelta: ', state)
    Object.entries(state)
    .map((entry) => {
      setTimeout(function(that) {
        that.onDeviceChange({
          "name": entry[0],
          "value": entry[1],
          "physicalTrigger": false
        });
      }, 1, this);
    });
  }

  /*
   * Expecting data looking like
   * {
   *   "name": "Main.Mute",
   *   "value": "Off",
   *   "physicalTrigger": true
   * }
   */
  onDeviceChange(data) {
    let update = {};
    update[data.name] = data.value;
    if (data.physicalTrigger) {

      console.log('onDeviceChange physicalTrigger:', update);
      this._iotShadow.updateDesiredState(update, (error, state) => console.log('desired state updated:', JSON.stringify(state)));
    } else {

      console.log('onDeviceChange NOT physicalTrigger:', update);
      this._deviceState.update(update);
    }
  }
};