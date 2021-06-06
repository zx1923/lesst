const { spawn } = require('child_process');
const helper = require('../utils/helper');
const printer = require('../utils/printer');

process.stdin.setEncoding('utf8');

/**
 * 是否在控制台打印输出
 * 
 * @param {boolean} show 是否显示输出
 * @param {string} data 显示的数据
 */
function processOut(show, data) {
  if (!show || !process.stdout.writable) return;
  process.stdout.write(data);
}

/**
 * 向给定的 stdin 流写入数据
 * 
 * @param {object} stdobj stdin对象
 * @param {string|buffer} data 写入的数据
 */
function stdinWrite(stdobj, data) {
  if (stdobj.writable) {
    stdobj.write(data);
  }
}

function Cmder(cmd = '', args = [], options = {}) {
  this.cmd = cmd;
  this.args = args
  this.options = options;
  this.execInstance = null;
  this.chunkOut = '';
  this.chunkIn = '';
  this.failedNotes = [];
  this.showStdout = true;
  this._prelk = `PS ${process.cwd()}> `;
}

/**
 * 开始执行命令
 * 
 * @returns 
 */
Cmder.prototype.begin = function () {
  if (!this.execInstance) {
    const opts = {
      shell: true,
      ...this.options,
    };
    this.execInstance = spawn(this.cmd, this.args, opts);
  }
  const stdcmdOut = this._prelk + helper.cmdStringify(this.cmd, this.args).bold() + '\n';
  processOut(this.showStdout, stdcmdOut.cyan());

  this.execInstance.stdout.on('data', chunk => {
    this.chunkOut += chunk;
    processOut(this.showStdout, chunk);
  });

  this.execInstance.stderr.on('data', errdata => {
    processOut(this.showStdout, errdata.toString());
    this.execInstance.stderr.on('end', () => {
      process.exit(0);
    });
  });
  return this;
};

/**
 * 是否在控制台显示输出
 * 
 * @param {boolean} value 是否显示
 */
Cmder.prototype.display = function (value) {
  this.showStdout = value;
  return this;
};

/**
 * 保持当前状态，in/out 清零
 */
Cmder.prototype.keep = function () {
  this.chunkOut = '';
  this.chunkIn = '';
  return this;
};

/**
 * 对 stdout 的输出结果断言
 * 
 * @param {function} fn 测试函数
 * @returns 
 */
Cmder.prototype.assert = function (fn) {
  if (!helper.isFunction(fn)) {
    throw `Parameter 'fn' must be a function`.red();
  }
  try {
    fn(this.chunkOut);
  }
  catch (err) {
    if (this.showStdout) {
      printer.red(`Assertion detected an error: `, err.message.trim());
    }
    // 记录错误
    this.failedNotes.push({
      cmd: this.cmd,
      args: this.args, 
      stdout: this.chunkOut,
      stdin: this.chunkIn,
      failed: err.message.trim()
    });
  };
  return this;
};

/**
 * 获取断言失败的数据
 * 
 * @returns 
 */
Cmder.prototype.getFailed = function () {
  return this.failedNotes;
};

/**
 * 延时等待
 * 
 * @param {number} ms 等待时间，毫秒
 * @returns 
 */
Cmder.prototype.wait = async function (ms) {
  await helper.delay(ms);
  return this;
};

/**
 * 等待直到有特征出现
 * 
 * @param {Reg|Function} target 特征目标
 * @param {number} timeout 超时时间，单位：毫秒
 */
Cmder.prototype.waitFor = async function (target, timeout = 3000) {
  // TODO: 
  // 如果 target 是正则，则使用 chunkout 的数据全局匹配
  // 如果 target 是 function ，则传入 chunkout 的数据由回调函数完成匹配
};

/**
 * 等待直到有数据回显
 * 
 * @param {number} timeout 超时时间，单位：毫秒
 */
Cmder.prototype.waitForData = async function (timeout = 3000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (!this.chunkOut) {
      await helper.delay();
      continue;
    }
    return this;
  }
  // 打印超时日志
  return this;
};

/**
 * 向 child 进程的 stdin 写入数据
 * 
 * @param {string} data 写入的数据
 * @returns 
 */
Cmder.prototype.writeIn = function (data) {
  this.chunkIn = data;
  const input = `${this.chunkIn}\n`;
  if (this.execInstance.stdin.writable) {
    processOut(this.showStdout, input);
    this.execInstance.stdin.write(input);
  }
  return this;
};

/**
 * 模拟键盘按键输入
 * 
 * @param {number} key 键盘输入
 */
Cmder.prototype.writeKey = function (key) {
  stdinWrite(this.execInstance.stdin, Buffer.from(key));
  return this;
};

/**
 * 模拟用户输入回车键
 * 
 * @returns 
 */
Cmder.prototype.enter = function () {
  stdinWrite(this.execInstance.stdin, '\n');
  return this;
}

/**
 * 关闭当前子进程
 */
Cmder.prototype.close = function () {
  try {
    if (this.execInstance !== null) {
      this.execInstance.kill();
    }
  }
  catch (err) {
    printer.red(`Child process termination failed:`, err.message.trim());
  }
}

module.exports = Cmder;