// const NadController = require('nad-controller');

module.exports = class Controller {


  constructor(iotShadow) {
    this._iotShadow = iotShadow;

    this.deviceState = {
      "mute": "off",
      "power": "on",
      "source": "video",
      "speakerA": "on",
      "speakerB": "off",
      "tape1": "off"
    };

    this.initialize(() => {
      console.log('initialize complete');
      this._iotShadow.on('delta', this.onDelta.bind(this));
    });
  }

  initialize(callback) {
    this._iotShadow.getDesiredState((error, stateObject) => {
      if (error) {
        console.log('ERROR initialize: ' + error);
        return;
      }

      this.updateLocalState(stateObject.state.desired, (error, localState) => {
        if (error) {
          console.log('ERROR initialize: ' + error);
          return;
        }

        this.reportCurrentState(callback);
      });
    });
  }

  updateLocalState(newState, callback) {
    this.deviceState = Object.assign(this.deviceState, newState);
    callback(null, this.deviceState);
  }

  reportCurrentState(callback) {

    this._iotShadow.updateReported(this.deviceState, callback);
  }

  onDelta(state) {
    this.updateLocalState(state, (error, localState) => {
      if (error) {
        console.log('ERROR onDelta: ' + error);
        return;
      }

      this.reportCurrentState(() => {
        console.log('local state updated and reported back');
      });

    });
  }
};