import { Printer, createPrinterAdapter } from "../utils/printer";
import helper from "../utils/helper";

const { spawn } = require('child_process');

const printer = new Printer('Cmder');
process.stdin.setEncoding('utf8');

interface CmderOptions {
  stdout: boolean,
  stderr: boolean
}

interface ExecInstance {
  stdout: NodeJS.ReadWriteStream,
  stdin: NodeJS.ReadWriteStream,
  stderr: NodeJS.ReadWriteStream,
  kill(): void
};

enum CmdChanel { stdout, stderr };
enum ChanelName {
  chunkOut = 'chunkOut',
  chunkErr = 'chunkErr' 
};

declare function AssertCallback(stdout: string, stderr: string): void;
declare function WaitTargerFun(stdout: string, stderr: string): boolean;

/**
 * 创建控制台打印输出实例
 * 
 * @param show 是否显示输出
 * @param data 显示的数据
 */
function createProcessOutInstance(show: boolean): Function {
  if (show) {
    return data => {
      if (process.stdout.writable) {
        process.stdout.write(data);
      }
    }
  }
  return () => {};
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

class Cmder {
  cmd: string
  args: Array<string>
  options: CmderOptions
  execInstance: ExecInstance
  chunkOut: string
  chunkIn: string
  chunkErr: string
  failedNotes: Array<tFailedInfo>
  processOut: Function
  printerInstance: Printer
  chanelName: ChanelName
  _prelk: string

  constructor(cmd = '', args = [], options: CmderOptions) {
    this.cmd = cmd;
    this.args = args
    this.options = options;
    this.execInstance = null;
    this.chunkOut = '';
    this.chunkIn = '';
    this.chunkErr = '';
    this.chanelName = ChanelName.chunkOut;
    this.failedNotes = [];
    this.processOut = createProcessOutInstance(options && options.stdout);
    this.printerInstance = createPrinterAdapter('Cmder', options && options.stdout);
    this._prelk = `PS ${process.cwd()}> `;
  }

  /**
   * 开始执行命令
   * 
   * @returns 
   */
  begin(): Cmder {
    if (!this.execInstance) {
      const opts = {
        shell: true,
        ...this.options,
      };
      this.execInstance = spawn(this.cmd, this.args, opts);
    }
    const stdcmdOut = this._prelk + helper.cmdStringify(this.cmd, this.args).bold() + '\n';
    this.processOut(stdcmdOut.cyan());
  
    this.execInstance.stdout.on('data', chunk => {
      this.chunkOut += chunk;
      this.processOut(chunk);
    });
  
    this.execInstance.stderr.on('data', chunk => {
      this.chunkErr += chunk;
      this.processOut(chunk.toString().red());
    });
    return this;
  }

  /**
   * 保持当前状态，in/out 清零
   */
  keep(): Cmder {
    this.chunkOut = '';
    this.chunkIn = '';
    this.chunkErr = '';
    return this;
  };

  /**
   * 对 stdout 的输出结果断言
   * 
   * @param {function} fn 测试函数
   * @returns 
   */
  assert(fn: typeof AssertCallback): Cmder {
    if (!helper.isFunction(fn)) {
      throw `Parameter 'fn' must be a function`.red();
    }
    try {
      fn(this.chunkOut, this.chunkErr);
    }
    catch (err) {
      this.printerInstance.error(`Assertion detected an error: `, err.message.trim());
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
  getFailed(): Array<tFailedInfo> {
    return this.failedNotes;
  };

  /**
   * 延时等待
   * 
   * @param ms 等待时间，毫秒
   * @returns 
   */
  async wait(ms: number = 3000): Promise<Cmder> {
    await helper.delay(ms);
    return this;
  };

  /**
   * 设置检测通道
   * @param value 通道名
   * @returns 
   */
  chanel(value: CmdChanel) {
    if (value === CmdChanel.stdout) {
      this.chanelName = ChanelName.chunkOut;
    }
    else if (value === CmdChanel.stderr) {
      this.chanelName = ChanelName.chunkErr;
    }
    return this;
  }

  /**
   * 等待直到有特征出现
   * 
   * @param target 特征目标
   * @param timeout 超时时间，单位：毫秒
   */
  async waitFor(target: any | RegExp | typeof WaitTargerFun, timeout: number = 3000) {
    let regsCallback;
    if (helper.isFunction(target)) {
      regsCallback = target;
    }
    else if (target instanceof RegExp) {
      regsCallback = (chunk: string) => {
        return target.test(chunk);
      }
    }
    else {
      const comReg = new RegExp(target.toString());
      regsCallback = (chunk: string) => {
        return comReg.test(chunk);
      }
    }
    const start = Date.now();
    while (Date.now() -  start < timeout) {
      if (!await regsCallback(this[this.chanelName])) {
        await helper.delay(100);
        continue;
      }
      return this;
    }
    return this;
  };

  /**
   * 等待直到有数据回显
   * 
   * @param timeout 超时时间，单位：毫秒
   */
  async waitForData(timeout: number = 3000): Promise<Cmder> {
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
   * @param data 写入的数据
   * @returns 
   */
  writeIn(data: string): Cmder {
    this.chunkIn = data;
    const input = `${this.chunkIn}\n`;
    if (this.execInstance.stdin.writable) {
      this.processOut(input);
      this.execInstance.stdin.write(input);
    }
    return this;
  };

  /**
   * 模拟键盘按键输入
   * 
   * @param {number} key 键盘输入
   */
  writeKey(key: Int8Array): Cmder {
    stdinWrite(this.execInstance.stdin, Buffer.from(key));
    return this;
  };

  /**
   * 模拟用户输入回车键
   * 
   * @returns 
   */
  enter(): Cmder {
    stdinWrite(this.execInstance.stdin, '\n');
    return this;
  }

  /**
   * 关闭当前子进程
   */
  close() {
    try {
      if (this.execInstance !== null) {
        this.execInstance.kill();
      }
    }
    catch (err) {
      printer.error(`Child process termination failed:`, err.message.trim());
    }
  }
};

export default Cmder;