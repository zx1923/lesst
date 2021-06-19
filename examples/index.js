const askCmdTest = require('./ask.cmdtest');
const confirmCmdTest = require('./confirm.cmdtest');
const cliCmdTest = require('./cli.cmdtest');

async function run() {
  await askCmdTest();
  await confirmCmdTest();
  await cliCmdTest();
};

run();