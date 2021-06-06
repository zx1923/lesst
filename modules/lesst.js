const TestFlow = require('./testflow');
const emoji = require('node-emoji');
const chai = require('chai');
const printer = require('../utils/printer');

/**
 * 特殊按键定义
 */
const KeyBoard = {
  Left: [0x1b, 0x5b, 0x44],
  Up: [0x1b, 0x5b, 0x41],
  Right: [0x1b, 0x5b, 0x43],
  Down: [0x1b, 0x5b, 0x42],
};

/**
 * 定义测试章节
 * 
 * @param {object} opts section属性
 * @param {function} fn 回调函数
 * @returns 
 */
function section(opts = {}, fn) {
  return new Promise(async resolve => {
    if (!opts || !opts.title) {
      printer.red(`Section test must have a title`);
      resolve();
      return;
    }
    printer.ln();
    printer.cyan(emoji.get('coffee'), `#### Section: ${opts.title}\n`.bold());
    const testflow = new TestFlow({ stdout: opts.stdout });
    await fn(testflow);
    // 开始测试
    await testflow.start();
    // 分析结果
    if (opts.analysis) {
      testflow.analyse();
    }
    printer.ln();
    printer.cyan(emoji.get('tomato'), `All complete`);
    resolve();
  });
}

/**
 * 生成一个命令定义
 * 
 * @param {string} cmd 命令
 * @param {array} args 参数
 * @param {object} opts 启动属性
 * @returns 
 */
function cmdline(cmd, args = [], opts = {}) {
  return { cmd, args, opts };
}

module.exports = {
  section,
  cmdline,
  KeyBoard,
  ...chai,
};