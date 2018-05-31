const EventEmitter = require('events');
const NadController = require('nad-controller').NadController;
const MODELS = require('nad-controller').MODELS;
const DeviceState = require('./device-state');

module.exports = class Controller extends EventEmitter {

  constructor(iotShadow) {
    super();
    this._iotShadow = iotShadow;
    this._nadController = new NadController('/dev/ttyUSB0', {
      model: MODELS.C355
    });
  }

  connect(callback) {

    this._nadController.open((error) => {
      if (error) {
        callback(error);
        return;
      }

      this._nadController.getAllStates((error, statesArray) => {
        if (error) {
          this._nadController.close(() => callback(error));
          return;
        }

        let states = {};
        statesArray.map((state) => states[state.name] = state.value);

        this._deviceState = new DeviceState(states);

        this._deviceState.on('update', this.onStateChanged.bind(this));
        this._iotShadow.on('delta', this.onDelta.bind(this));

        this._iotShadow.updateReportedState(this._deviceState.getState(), (error, update) => {
          if (error) {
            this.emit(error);
          }

          this._nadController.close(() => callback(error));
        });
      });
    });
  }

  onStateChanged(update) {
    if (Object.keys(update).length === 0) {
      return;
    }

    this._iotShadow.updateReportedState(update, (error, update) => {
      if (error) {
        this.emit(error);
      }
    });
  }

  onDelta(state) {

    Object.entries(state)
    .map((entry) => {
      this._nadController.set(entry[0], entry[1], (error) => {
        if (error) {
          this.emit(error);
        }
      });
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

      this._iotShadow.updateDesiredState(update, (error, state) => {
        if (error) {
          this.emit(error);
        }
      });
    } else {

      this._deviceState.update(update);
    }
  }
};