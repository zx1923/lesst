const { section, cmdline } = require('../dist');
const { expect } = require('chai');

const WaitTime = 1000;
const sectionInfo = {
  title: '[Testing] examples/cmdline/confirm.js',
  stdout: true,
  analysis: true,
};

const cmdbody = cmdline('node', ['examples/cmdline/confirm.js']);

module.exports = () => {
  return section(sectionInfo, function (testflow) {

    testflow.test('Confirm 输入 y 应该返回 Yes', cmdbody, async cmdline => {
      const inp = 'y';
      //
      (await cmdline.begin().wait(WaitTime)).assert(
        out => {
          expect(out).to.include('Are you handsome?');
        }
      );
      // 
      (await cmdline.keep().writeIn(inp).waitFor('Yes')).assert(
        out => {
          expect(out).to.include(`? Are you handsome? Yes`);
        }
      );
    });

  });
};