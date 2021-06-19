const path = require('path');

function _is(obj: any, type: string): boolean {
  return getTypeOf(obj) === type;
}

function pathJoin(base: string, ...args: Array<string>): string {
  return path.join(base, ...args);
}

function urlJoin(base: string, ...args: Array<string>): string {
  return this.pathJoin(base, ...args).replace(/\\+|\/+/g, '/');
}

/**
 * 获取数据类型
 * 
 * @param obj 
 * @returns string 
 */
function getTypeOf(obj: any): string {
  let type = Object.prototype.toString.call(obj);
  return type.replace(/\[object\s|\]/g, '');
}

/**
 * 是否为对象
 * 
 * @param obj 被检测值
 * @returns true/false
 */
function isObject(obj: any): boolean {
  return _is(obj, 'Object');
}

/**
 * 是否为a array
 * 
 * @param obj 被检测值
 * @returns true/false
 */
function isArray(obj: any): boolean {
  return _is(obj, 'Array');
}

/**
 * 是否为 function
 * 
 * @param obj 被检测值
 * @returns true/false
 */
function isFunction(obj: any): boolean {
  return _is(obj, 'Function') || _is(obj, 'AsyncFunction');
}

/**
 * 延时等待
 * 
 * @param {number} ms 毫秒
 * @returns 
 */
function delay(ms: number = 0): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

/**
 * 基于模板自服务构建循环字符串
 * 
 * @param char 模板字符
 * @param times 次数
 * @returns 
 */
function strRepeat(char: string = '', times: number = 1): string {
  let res = '';
  while(times--) {
    res += char;
  }
  return res;
}

/**
 * 将命令和参数组装成命令字符串
 * 
 * @param cmd 命令
 * @param args 参数
 * @returns 
 */
function cmdStringify(cmd: string, args: Array<string> = []): string {
  if (!args.length) {
    return cmd;
  }
  let res = cmd;
  args.forEach(el => {
    res += ' ' + el
  });
  return res;
}

export default {
  pathJoin,
  urlJoin,
  getTypeOf,
  isObject,
  isArray,
  isFunction,
  strRepeat,
  delay,
  cmdStringify,
}