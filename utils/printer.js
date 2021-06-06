const chalk = require('chalk');
const STRING_USE = ['bold', 'red', 'redBright', 'cyan', 'grey', 'yellow', 'green', 'blue', 'black', 'bgBlack', 'bgWhite', 'bgBlue', 'bgCyan', 'bgGray', 'bgGreen', 'bgRed', 'bgYellow', 'white'];

STRING_USE.forEach(el => {
  String.prototype[el] = function () {
    return chalk[el](this);
  }
});

// chalk.bgYellow

const LOG_MAP = {
  log: 'white',
  cyan: 'cyan',
  red: 'red',
  yellow: 'yellow',
  blue: 'blue',
  green: 'green',
};

function Priner(tag) {
  this.tag = tag;

  this._print = function (type, ...msgs) {
    const color = LOG_MAP[type];
    msgs.forEach((el, index) => {
      msgs[index] = chalk[color](el);
    });
    console.log(...msgs);
  }
}

Priner.prototype.ln = function() {
  console.log();
}

Priner.prototype.print = console.log;

Priner.prototype.log = function (...msgs) {
  this._print('log', ...msgs);
}

Priner.prototype.cyan = function (...msgs) {
  this._print('cyan', ...msgs);
}

Priner.prototype.red = function (...msgs) {
  this._print('red', ...msgs);
}

Priner.prototype.yellow = function (...msgs) {
  this._print('yellow', ...msgs);
}

Priner.prototype.blue = function (...msgs) {
  this._print('blue', ...msgs);
}

Priner.prototype.green = function (...msgs) {
  this._print('green', ...msgs);
}

const printer = new Priner();

module.exports = printer;