const { expect, section, cmdline, KeyBoard } = require('../modules/lesst');

const WaitTime = 1000;
const sectionInfo = {
  title: '测试 test-cli 命令行工具',
  stdout: true,
  analysis: true,
};

function testCli() {
  let cmdbody = cmdline('test-cli', ['-h']);
  return section(sectionInfo, function (testflow) {

    // test-cli -h
    testflow.test('执行 test-cli -h 应该返回帮助信息', cmdbody, async cmdline => {
      //
      (await cmdline.begin().wait(500)).assert(
        out => {
          expect(out).to.include('Options').include('Commands');
        }
      );
    });

    // test-cli -V
    cmdbody = cmdline('test-cli', ['-V']);
    testflow.test('执行 test-cli -V 应该返回版本号', cmdbody, async cmdline => {
      //
      (await cmdline.begin().wait(500)).assert(
        out => {
          expect(out).to.equal('0.1.0\n');
        }
      );
    });

    // test-cli -i init
    cmdbody = cmdline('test-cli', ['-i', 'init']);
    testflow.test('执行 test-cli -i init 应该返回平台信息', cmdbody, async cmdline => {
      //
      (await cmdline.begin().wait(WaitTime)).assert(
        out => {
          expect(out).to.include('pass').include('sass').include('iaas');
        }
      );
      //
      (await cmdline.keep().writeKey(KeyBoard.Down).enter().wait(WaitTime)).assert(
        out => {
          expect(out).to.include('请选择平台类型? sass');
        }
      );
      //
      (await cmdline.keep().writeKey(KeyBoard.Down).enter().wait(WaitTime)).assert(
        out => {
          expect(out).to.include('请选择您包含的虚拟机数量? 200').include(`{"plattype":"sass","vmCounts":"200"}`);
        }
      );
    });

    // test-cli -i login
    cmdbody = cmdline('test-cli', ['-i', 'login']);
    testflow.test('执行 test-cli -i login 应该返回登录信息', cmdbody, async cmdline => {
      const tUname = 'Sean';
      const tUpass = '123456';
      //
      (await cmdline.begin().wait(WaitTime)).assert(
        out => {
          expect(out).to.include('请输入用户名');
        }
      );
      //
      (await cmdline.keep().writeIn(tUname).wait(WaitTime)).assert(
        out => {
          expect(out).to.include('请输入用户密码');
        }
      );
      //
      (await cmdline.keep().writeIn(tUpass).wait(WaitTime)).assert(
        out => {
          expect(out).to.include('您登陆的账户信息如下').include(`{"username":"${tUname}","password":"${tUpass}"}`);
        }
      );
    });

  });
}

module.exports = testCli;