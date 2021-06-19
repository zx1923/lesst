const chalk = require('chalk');
const STRING_USE = ['bold', 'red', 'redBright', 'cyan', 'grey', 'yellow', 'green', 'blue', 'black', 'bgBlack', 'bgWhite', 'bgBlue', 'bgCyan', 'bgGray', 'bgGreen', 'bgRed', 'bgYellow', 'white'];

STRING_USE.forEach(el => {
  String.prototype[el] = function () {
    return chalk[el](this);
  }
});

enum ColorType { cyan, red, yellow, green, blue };

/**
 * 打印字符串消息
 * 
 * @param color 类型
 * @param msgs 消息
 */
function printByType(color: ColorType, ...msgs: Array<string>) {
  const msglog = msgs.map(el => {
    return chalk[ColorType[color]](el);
  });
  console.log(...msglog);
}

/**
 * 处理控制台打印
 */
class Printer {
  tag: string
  constructor (tag: string) {
    this.tag = tag;
  }

  ln() {
    console.log();
  }
  
  info(...msgs: Array<string>) {
    printByType(ColorType.cyan, ...msgs);
  }
  
  error(...msgs: Array<string>) {
    printByType(ColorType.red, ...msgs);
  }
  
  warn(...msgs: Array<string>) {
    printByType(ColorType.yellow, ...msgs);
  }
  
  label(...msgs: Array<string>) {
    return this.warn(...msgs);
  }
  
  success(...msgs: Array<string>) {
    printByType(ColorType.green, ...msgs);
  }
}

function createPrinterAdapter (tag: string, stdout: boolean, stderr?: boolean): Printer {
  const instance = new Printer(tag);
  if (!stdout) {
    ['ln', 'info', 'error', 'warn', 'label', 'success'].forEach(fn => {
      instance[fn] = () => {};
    });
  }
  return instance;
}

export {
  Printer,
  createPrinterAdapter,
};