const chalk = require('chalk');
const STRING_USE = ['bold', 'red', 'redBright', 'cyan', 'grey', 'yellow', 'green', 'blue', 'black', 'bgBlack', 'bgWhite', 'bgBlue', 'bgCyan', 'bgGray', 'bgGreen', 'bgRed', 'bgYellow', 'white'];

STRING_USE.forEach(el => {
  String.prototype[el] = function () {
    return chalk[el](this);
  }
});

const LOG_MAP = {
  log: 'white',
  cyan: 'cyan',
  red: 'red',
  yellow: 'yellow',
  blue: 'blue',
  green: 'green',
};

/**
 * 打印字符串消息
 * 
 * @param {string} type 类型
 * @param  {...any} msgs 消息
 */
function printByType(type, ...msgs) {
  const color = LOG_MAP[type];
  const msglog = msgs.map(el => {
    return chalk[color](el);
  });
  console.log(...msglog);
}

/**
 * 处理控制台打印
 */
class Printer {
  constructor (tag) {
    this.tag = tag;
  }

  ln() {
    console.log();
  }
  
  info(...msgs) {
    printByType('cyan', ...msgs);
  }
  
  error(...msgs) {
    printByType('red', ...msgs);
  }
  
  warn(...msgs) {
    printByType('yellow', ...msgs);
  }
  
  label(...msgs) {
    return this.warn(...msgs);
  }
  
  success(...msgs) {
    printByType('green', ...msgs);
  }
}

class PrinterAdapter {
  constructor(tag, stdout = true) {
    if (stdout) {
      const instance = new Printer(tag);
      return instance;
    }
    
    const instance = {};
    ['ln', 'info', 'error', 'warn', 'label', 'success'].forEach(fn => {
      instance[fn] = () => {};
    });
    return instance;
  }
}

module.exports = {
  Printer,
  PrinterAdapter,
};