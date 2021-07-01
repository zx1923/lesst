import Cmder from './cmder';
import helper from "../utils/helper";
import { Printer, createPrinterAdapter } from "../utils/printer";
const emoji = require('node-emoji');

const printer = new Printer('TestFlow');

declare function tfItemCallback(cmdline: Cmder): Promise<void>;

interface TFOptions {
  stdout: boolean,
  stderr?: boolean,
}

interface iCmdBody {
  cmd: string, 
  args: Array<string>, 
  opts: any,
}

interface TFItem {
  desc: string,
  cmdbody: iCmdBody,
  callback: typeof tfItemCallback,
}

interface TFResults {
  failed: Array<{
    desc: string,
    notes: Array<tFailedInfo>,
  }>
}

interface TFHooks {
  beforeAllFn: Function,
  afterAllFn: Function,
  beforeEachFn: Function,
  afterEachFn: Function,
}

/**
 * 处理错误记录
 * @param context TestFlow 实例
 */
function dealWidthErrorNotes(context: TestFlow, desc: string, errorNotes: Array<tFailedInfo>) {
  if (!errorNotes.length) {
    context._print.success(emoji.get('sunglasses'), `Done`);
    return;
  }

  context.results.failed.push({
    desc,
    notes: errorNotes,
  });
  context._print.warn(emoji.get('unamused'), `Failed`);
}

/**
 * 测试工作流
 * @param {object} opts 测试属性
 */
class TestFlow {
  opts: TFOptions
  flow: Array<TFItem>
  results: TFResults
  hooks: TFHooks
  _print: Printer

  constructor(opts: TFOptions) {
    this.opts = opts;
    this.flow = [];
    this.hooks = {
      beforeAllFn() {},
      afterAllFn() {},
      beforeEachFn() {},
      afterEachFn() {},
    };
    this.results = {
      failed: [],
    };

    this._print = createPrinterAdapter('TestFlow', opts && opts.stdout);
  }

  /**
   * 在所有测试前执行
   * @param callback 回调函数
   * @returns 
   */
  beforeAll(callback: Function): Promise<any> {
    if (helper.isFunction(callback)) {
      this.hooks.beforeAllFn = callback.bind(this);
    }
    return Promise.resolve();
  }

  /**
   * 在每个测试执行前回调
   * @param callback 回调函数
   * @returns 
   */
  beforeEach(callback: Function): Promise<any> {
    if (helper.isFunction(callback)) {
      this.hooks.beforeEachFn = callback.bind(this);
    }
    return Promise.resolve();
  }

  /**
   * 在所有测试结束后回调
   * @param callback 回调函数
   * @returns 
   */
  afterAll(callback: Function): Promise<any> {
    if (helper.isFunction(callback)) {
      this.hooks.afterAllFn = callback.bind(this);
    }
    return Promise.resolve();
  }

  /**
   * 在每个测试执行前回调
   * @param callback 回调函数
   * @returns 
   */
  afterEach(callback: Function): Promise<any> {
    if (helper.isFunction(callback)) {
      this.hooks.afterEachFn = callback.bind(this);
    }
    return Promise.resolve();
  }

  /**
   * 塞入测试
   * @param desc 测试项描述
   * @param cmdbody 测试命令
   * @param callback 测试方法
   */
  test(desc = '', cmdbody: iCmdBody, callback: typeof tfItemCallback) {
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
  async start() {
    // beforeAll hooks
    this.hooks.beforeAllFn();

    for (let i = 0, len = this.flow.length; i < len; i++) {
      const { desc, cmdbody, callback } = this.flow[i];
      cmdbody.opts.stdout = this.opts && this.opts.stdout;
      const cmder = new Cmder(cmdbody.cmd, cmdbody.args, cmdbody.opts);
      this._print.label(emoji.get('label'), `[Test.${i + 1}]`, `${desc}`.bold());
      this._print.info(helper.strRepeat('-', 40));

      // beforeEach hooks 
      this.hooks.beforeEachFn();

      // test function
      await callback(cmder).catch(err => {
        printer.error(err);
        process.exit(0);
      });
      cmder.close();

      // deal width error notes
      const errorNotes = cmder.getFailed();
      dealWidthErrorNotes(this, desc, errorNotes);

      // afterEach hooks 
      this.hooks.beforeEachFn();
      this._print.info(`${helper.strRepeat('-', 40)}\n`);
    }

    // afterAll hooks
    this.hooks.afterAllFn();
  }

  /**
   * 分析并打印测试结果
   */
  analyse() {
    const passCount = this.flow.length - this.results.failed.length;
    if (!this.results.failed.length) {
      printer.success(emoji.get('sparkles'), `${passCount} / ${this.flow.length} Passed,`, `Pass rate is 100%`);
      return;
    }

    const passRate = (1 - this.results.failed.length / this.flow.length) * 100;
    printer.warn(emoji.get('hankey'), `${passCount} / ${this.flow.length} Passed,`, `Pass rate is ${passRate.toFixed(2)}%`);
    printer.warn(`${helper.strRepeat('=', 40)}`);

    // 打印错误记录
    this.results.failed.forEach((el, secIdx) => {
      const errNotes = el.notes;
      if (!errNotes.length) {
        return;
      }
      
      errNotes.forEach((note, itIdx) => {
        printer.ln();
        printer.warn(` Test.${secIdx + 1} Assert.${itIdx + 1} `.black().bgYellow(), el.desc);
        printer.info('Command:', helper.cmdStringify(note.cmd, note.args));
        printer.error(note.failed);
      });
    });
  }
};

export default TestFlow;