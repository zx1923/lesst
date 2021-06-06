const { expect, section, cmdline, KeyBoard } = require('../modules/lesst');

const sectionInfo = {
  title: '[Testing] examples/cmdline/ask.js',
  stdout: true,
  analysis: true,
};

const cmdbody = cmdline('node', ['examples/cmdline/ask.js']);

module.exports = () => {
  return section(sectionInfo, function (testflow) {

    testflow.test('test input name as Sean', cmdbody, async cmdline => {
      const inpName = 'Sean';
      //
      (await cmdline.begin().waitForData()).assert(
        out => {
          expect(out).to.include('name');
        }
      );
      // 
      (await cmdline.keep().writeIn(inpName).waitForData()).assert(
        out => {
          expect(out).to.include(`name is ${inpName}`);
        }
      );
    });
    
    testflow.test('test input name as Nancy', cmdbody, async cmdline => {
      const inpName = 'Nancy';
      //
      (await cmdline.begin().waitForData()).assert(
        out => {
          expect(out).to.include('name');
        }
      );
      // 
      (await cmdline.keep().writeIn(inpName).waitForData()).assert(
        out => {
          expect(out).to.include(`name is ${inpName}`);
        }
      );
    });

  });
};