const fs = require('fs');
const minimist = require('minimist');

module.exports = class CmdParser {

  constructor(args) {

    let unknownFunction = (arg) => this.printHelp('***unrecognized options***: ' + arg);

    this.parsedArgs = minimist(args, {
      string: [
        'private-key',
        'client-certificate',
        'ca-certificate',
        'client-id',
        'thing-name',
        'host'
      ],
      integer: [
      ],
      boolean: [
        'help',
        'debug'
      ],
      alias: {
        clientId: ['i', 'client-id'],
        privateKey: ['k', 'private-key'],
        clientCert: ['c', 'client-certificate'],
        caCert: ['a', 'ca-certificate'],
        thingName: ['T', 'thing-name'],
        hostName: ['H', 'host'],
        debug: ['D', 'debug'],
        help: 'h'
      },
      default: {
         debug: false
      },
      unknown: unknownFunction.bind(this)
    });

    if (this.parsedArgs.help) {
      this.printHelp();
      return;
    }

    if (!this.parsedArgs.privateKey || !fs.existsSync(this.parsedArgs.privateKey)) {
      this.printHelp(' must specify a privateKey');
    }

    if (!this.parsedArgs.clientCert || !fs.existsSync(this.parsedArgs.clientCert)) {
      this.printHelp(' must specify a clientCert');
    }

    if (!this.parsedArgs.caCert || !fs.existsSync(this.parsedArgs.caCert)) {
      this.printHelp(' must specify a caCert');
    }

    if (!this.parsedArgs.clientId) {
      this.printHelp(' must specify a clientId');
    }

    if (!this.parsedArgs.thingName) {
      this.printHelp(' must specify a thingName');
    }

    if (!this.parsedArgs.host) {
      this.printHelp(' must specify a host');
    }

  }

  printHelp(error) {

    if (error) {
      console.error(error);
    }

    console.log('\n' +
      ' Options\n\n' +
      '  -i, --client-id=ID               use ID as client ID\n' +
      '  -H, --host-name=HOST             connect to HOST (overrides --aws-region)\n' +
      '  -k, --private-key=FILE           use FILE as private key\n' +
      '  -c, --client-certificate=FILE    use FILE as client certificate\n' +
      '  -a, --ca-certificate=FILE        use FILE as CA certificate\n' +
      '  -T, --thing-name=THINGNAME       access thing shadow named THINGNAME\n' +
      '  -h, --help                       print help text\n' +
      '  -D, --debug                      print additional debugging information\n\n');

    process.exit(1);
  }

  get clientId() {
    return this.parsedArgs.clientId;
  }

  get privateKey() {
    return this.parsedArgs.privateKey;
  }

  get clientCert() {
    return this.parsedArgs.clientCert;
  }

  get caCert() {
    return this.parsedArgs.caCert;
  }

  get thingName() {
    return this.parsedArgs.thingName;
  }

  get host() {
    return this.parsedArgs.hostName;
  }

  get debug() {
    return this.parsedArgs.debug;
  }
};