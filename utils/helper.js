const path = require('path');

function _is(obj, type) {
  return getTypeOf(obj) === type;
}

function pathJoin(base, ...args) {
  return path.join(base, ...args);
}

function urlJoin(base, ...args) {
  return this.pathJoin(base, ...args).replace(/\\+|\/+/g, '/');
}

/**
 * 获取数据类型
 * 
 * @param {any} obj 
 * @returns string 
 */
function getTypeOf(obj) {
  let type = Object.prototype.toString.call(obj);
  return type.replace(/\[object\s|\]/g, '');
}

/**
 * 是否为对象
 * 
 * @param {any} obj 被检测值
 * @returns true/false
 */
function isObject(obj) {
  return _is(obj, 'Object');
}

/**
 * 是否为a array
 * 
 * @param {any} obj 被检测值
 * @returns true/false
 */
function isArray(obj) {
  return _is(obj, 'Array');
}

/**
 * 是否为 function
 * 
 * @param {any} obj 被检测值
 * @returns true/false
 */
function isFunction(obj) {
  return _is(obj, 'Function') || _is(obj, 'AsyncFunction');
}

/**
 * 延时等待
 * 
 * @param {number} ms 毫秒
 * @returns 
 */
function delay(ms = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

/**
 * 基于模板自服务构建循环字符串
 * 
 * @param {string} char 模板字符
 * @param {number} times 次数
 * @returns 
 */
function strRepeat(char = '', times = 1) {
  let res = '';
  while(times--) {
    res += char;
  }
  return res;
}

/**
 * 将命令和参数组装成命令字符串
 * 
 * @param {string} cmd 命令
 * @param {array} args 参数
 * @returns 
 */
function cmdStringify(cmd, args = []) {
  if (!args.length) {
    return cmd;
  }
  args.forEach(el => {
    cmd += ' ' + el
  });
  return cmd;
}

module.exports = {
  pathJoin,
  urlJoin,
  getTypeOf,
  isObject,
  isArray,
  isFunction,
  strRepeat,
  delay,
  cmdStringify,
};