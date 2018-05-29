const EventEmitter = require('events');

module.exports = class DeviceState extends EventEmitter {

  constructor(deviceState) {
    super();
    this._deviceState = deviceState;
  }

  update(newState) {

    let updates = diff(this._deviceState, newState);
    this._deviceState = Object.assign(this._deviceState, newState);
    this.emit('update', updates);
  }

  getState() {
    return Object.assign({}, this._deviceState);
  }
}

function diff(target, update) {

  return Object.keys(update)
    .filter((key) => update[key] != target[key])
    .reduce((accumulator, value) => {
      accumulator[value] = update[value];
      return accumulator;
    }, {});
}