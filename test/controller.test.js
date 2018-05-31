const mockGetAllStates = jest.fn();
const mockOpen = jest.fn();
const mockClose = jest.fn();
const mockSet = jest.fn();

const mockIotOn = jest.fn();
const mockIotUpdateReportedState = jest.fn();
const mockIotUpdateDesiredState = jest.fn();

const mockDeviceStateOn = jest.fn();
const mockDeviceStateGetStates = jest.fn();
const mockDeviceStateUpdate = jest.fn();

jest.mock('nad-controller', () => {
  return {
    MODELS: {C355: 'd' },
    NadController: jest.fn().mockImplementation(() => {
      return {
        open: mockOpen,
        close: mockClose,
        getAllStates: mockGetAllStates,
        set: mockSet
      };
    })
  };
});

jest.mock('../src/iot-shadow', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: mockIotOn,
      updateReportedState: mockIotUpdateReportedState,
      updateDesiredState: mockIotUpdateDesiredState
    };
  });
});

jest.mock('../src/cmd-parser', () => {
  return jest.fn().mockImplementation(() => {
    return {};
  });
});

jest.mock('../src/device-state', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: mockDeviceStateOn,
      getState: mockDeviceStateGetStates,
      update: mockDeviceStateUpdate
    };
  });
});

const Controller = require('../src/controller');
const CmdParser = require('../src/cmd-parser');
const IotShadow = require('../src/iot-shadow');
const mockDeviceState = require('../src/device-state');

const cmdParser = new CmdParser();
const iotShadow = new IotShadow(cmdParser);

describe('Controller tests', () => {
  beforeAll(() => {
  });

  beforeEach(() => {
    mockGetAllStates.mockClear();
    mockOpen.mockClear();
    mockClose.mockClear();
    mockSet.mockClear();
    mockIotOn.mockClear();
    mockIotUpdateReportedState.mockClear();
    mockIotUpdateDesiredState.mockClear();
    mockDeviceState.mockClear();
  });

  test('Connecting test', (done) => {

    mockGetAllStates.mockImplementation((callback) => {
      callback(null, [{name: 'foo', value: 'bar'}]);
    });

    mockOpen.mockImplementation((callback) => {
      callback();
    });

    mockClose.mockImplementation((callback) => {
      callback();
    });

    mockIotUpdateReportedState.mockImplementation((update, callback) => {
      callback();
    });

    function callback(error) {
      expect(error).toBe(undefined);
      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockIotOn).toHaveBeenCalledTimes(1);
      expect(mockIotUpdateReportedState).toHaveBeenCalledTimes(1);
      expect(mockDeviceState).toHaveBeenCalledTimes(1);
      expect(mockDeviceState).toHaveBeenCalledWith({foo: 'bar'});
      done();
    }

    const controller = new Controller(iotShadow);
    controller.connect(callback);
  });

  test('Connecting test - open error', (done) => {

    mockGetAllStates.mockImplementation((callback) => {
      callback(null, [{name: 'foo', value: 'bar'}]);
    });

    mockOpen.mockImplementation((callback) => {
      callback('Open Error');
    });

    mockIotUpdateReportedState.mockImplementation((update, callback) => {
      callback();
    });

    function callback(error) {
      expect(error).toBe('Open Error');
      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockIotOn).toHaveBeenCalledTimes(0);
      expect(mockIotUpdateReportedState).toHaveBeenCalledTimes(0);
      expect(mockDeviceState).toHaveBeenCalledTimes(0);
      done();
    }

    const controller = new Controller(iotShadow);
    controller.connect(callback);
  });

  test('Connecting test - getAllStates error', (done) => {

    mockGetAllStates.mockImplementation((callback) => {
      callback('Get States Error');
    });

    mockOpen.mockImplementation((callback) => {
      callback();
    });

    mockClose.mockImplementation((callback) => {
      callback();
    });

    mockIotUpdateReportedState.mockImplementation((update, callback) => {
      callback();
    });

    function callback(error) {
      expect(error).toBe('Get States Error');
      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGetAllStates).toHaveBeenCalledTimes(1);
      expect(mockIotOn).toHaveBeenCalledTimes(0);
      expect(mockIotUpdateReportedState).toHaveBeenCalledTimes(0);
      expect(mockDeviceState).toHaveBeenCalledTimes(0);
      done();
    }

    const controller = new Controller(iotShadow);
    controller.connect(callback);
  });

test('Connecting test - updateReportedState error', (done) => {

    mockGetAllStates.mockImplementation((callback) => {
      callback(null, [{name: 'foo', value: 'bar'}]);
    });

    mockOpen.mockImplementation((callback) => {
      callback();
    });

    mockClose.mockImplementation((callback) => {
      callback();
    });

    mockIotUpdateReportedState.mockImplementation((update, callback) => {
      callback('update state error');
    });

    function callback(error) {
      expect(error).toBe('update state error');
      expect(mockOpen).toHaveBeenCalledTimes(1);
      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockGetAllStates).toHaveBeenCalledTimes(1);
      expect(mockIotOn).toHaveBeenCalledTimes(1);
      expect(mockIotUpdateReportedState).toHaveBeenCalledTimes(1);
      expect(mockDeviceState).toHaveBeenCalledTimes(1);
      done();
    }

    const controller = new Controller(iotShadow);
    controller.connect(callback);
  });

  test('test onStateChanged - empty state', () => {

    const controller = new Controller(iotShadow);
    controller.onStateChanged({});

    expect(mockIotUpdateReportedState).toHaveBeenCalledTimes(0);
  });

  test('test onStateChanged - with state', () => {

    const controller = new Controller(iotShadow);
    controller.onStateChanged({foo: 'bar'});

    expect(mockIotUpdateReportedState).toHaveBeenCalledTimes(1);
  });

  test('test onDelta', () => {

    const controller = new Controller(iotShadow);
    controller.onDelta({foo: 'bar', faz: 'baz'});

    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'foo', 'bar', expect.anything());
    expect(mockSet).toHaveBeenNthCalledWith(2, 'faz', 'baz', expect.anything());
  });

  test('test onDeviceChange - physicalTrigger = true', () => {

    const controller = new Controller(iotShadow);
    controller.onDeviceChange({name: 'foo', value: 'bar', physicalTrigger: true});

    expect(mockIotUpdateDesiredState).toHaveBeenCalledTimes(1);
    expect(mockDeviceStateUpdate).toHaveBeenCalledTimes(0);
    expect(mockIotUpdateDesiredState).toHaveBeenCalledWith({foo: 'bar'}, expect.anything());
  });

  test('test onDeviceChange - physicalTrigger = false', () => {

    const controller = new Controller(iotShadow);
    controller.connect(function() {});
    controller.onDeviceChange({name: 'foo', value: 'bar', physicalTrigger: false});

    expect(mockIotUpdateDesiredState).toHaveBeenCalledTimes(0);
    expect(mockDeviceStateUpdate).toHaveBeenCalledTimes(1);
    expect(mockDeviceStateUpdate).toHaveBeenCalledWith({foo: 'bar'});
  });
});
