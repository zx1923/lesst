const { expect, section, cmdline } = require('../dist');

const sectionInfo = {
  title: '[Testing] examples/cmdline/ask.js',
  stdout: true,
  analysis: true,
};

const cmdbody = cmdline('node', ['examples/cmdline/ask.js']);

module.exports = () => {
  return section(sectionInfo, function (testflow) {

    testflow.test('It should return Sean if input Sean', cmdbody, async cmdline => {
      const inpName = 'Sean';
      //
      (await cmdline.begin().waitForData()).assert(
        out => {
          expect(out).to.include('What`s your name ?');
        }
      );
      // 
      (await cmdline.keep().writeIn(inpName).waitFor('name is')).assert(
        out => {
          expect(out).to.include(`name is ${inpName}`);
        }
      );
    });
    
    testflow.test('It should return Nancy if input Nancy', cmdbody, async cmdline => {
      const inpName = 'Nancy';
      //
      (await cmdline.begin().waitForData()).assert(
        out => {
          expect(out).to.include('What`s your name ?');
        }
      );
      // 
      (await cmdline.keep().writeIn(inpName).waitFor('name is')).assert(
        out => {
          expect(out).to.include(`name is ${inpName}`);
        }
      );
    });

  });
};