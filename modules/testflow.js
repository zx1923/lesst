const Cmder = require('./cmder');
const helper = require('../utils/helper');
const printer = require('../utils/printer');
const emoji = require('node-emoji');

/**
 * 测试工作流
 * 
 * @param {object} opts 测试属性
 */
function TestFlow(opts = { stdout: true }) {
  this.opts = opts;
  this.flow = [];
  this.results = {
    failed: []
  };

  this._print = function (type, ...msgs) {
    if (!this.opts.stdout) return;
    printer[type](...msgs);
  }
}

/**
 * 塞入测试
 * 
 * @param {string} desc 测试项描述
 * @param {object} cmdbody 测试命令
 * @param {function} callback 测试方法
 */
TestFlow.prototype.test = function (desc = '', cmdbody, callback) {
  if (!desc) {
    throw `The testing description cannot be empty`;
  }
  if (!helper.isFunction(callback)) {
    throw `Parameter 'callback' must be a function`;
  }
  this.flow.push({ desc, cmdbody, callback });
}

/**
 * 启动命令测试
 */
TestFlow.prototype.start = async function () {
  for (let i = 0, len = this.flow.length; i < len; i++) {
    const { desc, cmdbody, callback } = this.flow[i];
    const cmder = new Cmder(cmdbody.cmd, cmdbody.args, cmdbody.opts);
    cmder.display(this.opts.stdout);
    this._print('yellow', emoji.get('label'), `[Test.${i + 1}]`, `${desc}`.bold());
    this._print('cyan', helper.strRepeat('-', 40));
    await callback(cmder).catch(err => {
      printer.red(err);
      process.exit(0);
    });
    cmder.close();
    const errorNotes = cmder.getFailed();
    if (errorNotes.length) {
      this.results.failed.push({
        desc,
        notes: errorNotes
      });
      this._print('yellow', emoji.get('unamused'), `Failed`);
    }
    else {
      this._print('green', emoji.get('sunglasses'), `Done`);
    }
    this._print('cyan', `${helper.strRepeat('-', 40)}\n`);
  }
}

/**
 * 分析并打印测试结果
 */
TestFlow.prototype.analyse = function () {
  const passCount = this.flow.length - this.results.failed.length;
  if (!this.results.failed.length) {
    printer.green(emoji.get('sparkles'), `${passCount} / ${this.flow.length} Passed,`, `Pass rate is 100%`);
    return;
  }
  const passRate = (1 - this.results.failed.length / this.flow.length) * 100;
  printer.yellow(emoji.get('hankey'), `${passCount} / ${this.flow.length} Passed,`, `Pass rate is ${passRate.toFixed(2)}%`);
  printer.yellow(`${helper.strRepeat('=', 40)}`);
  // 打印错误记录
  this.results.failed.forEach((el, secIdx) => {
    const errNotes = el.notes;
    if (!errNotes.length) {
      return;
    }
    errNotes.forEach((note, itIdx) => {
      printer.ln();
      printer.yellow(` Test.${secIdx + 1} Assert.${itIdx + 1} `.black().bgYellow(), el.desc);
      printer.cyan('Command:', helper.cmdStringify(note.cmd, note.args));
      printer.red(note.failed);
    });
  });
}

module.exports = TestFlow;