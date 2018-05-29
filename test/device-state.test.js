const DeviceState = require('../src/device-state');

test('Simple get test', () => {
  let state = new DeviceState({"foo":"bar"});
  expect(state.getState()).toEqual({"foo":"bar"});
});

test('Update existing key and value', () => {
  let state = new DeviceState({"foo":"bar"});
  state.update({"foo":"bar"});
  expect(state.getState()).toEqual({"foo":"bar"});
});

test('Update existing key with new value', () => {
  let state = new DeviceState({"foo":"bar"});
  state.update({"foo":"baz"});
  expect(state.getState()).toEqual({"foo":"baz"});
});

test('Update existing new key and value', () => {
  let state = new DeviceState({"foo":"bar"});
  state.update({"foz":"baz"});
  expect(state.getState()).toEqual({"foo":"bar", "foz":"baz"});
});

test('Update event test - no change', (done) => {
  function onUpdate(update) {
    expect(update).toEqual({});
    expect(state.getState()).toEqual({"foo":"bar", "alpha": "beta"});
    done();
  }
  let state = new DeviceState({"foo":"bar", "alpha": "beta"});
  state.on('update', onUpdate);
  state.update({"foo":"bar"});
});

test('Update event test - value change', (done) => {
  function onUpdate(update) {
    expect(update).toEqual({"foo":"baz"});
    expect(state.getState()).toEqual({"foo":"baz", "alpha": "beta"});
    done();
  }
  let state = new DeviceState({"foo":"bar", "alpha": "beta"});
  state.on('update', onUpdate);
  state.update({"foo":"baz"});
});

test('Update event test - value added', (done) => {
  let state = new DeviceState({"foo":"bar"});
  function onUpdate(update) {
    expect(update).toEqual({"alpha":"beta"});
    expect(state.getState()).toEqual({"foo":"bar", "alpha": "beta"});
    done();
  }
  state.on('update', onUpdate);
  state.update({"alpha":"beta"});
});