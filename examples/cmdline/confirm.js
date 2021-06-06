const inquirer = require('inquirer');

inquirer.prompt([
  {
    type: 'confirm',
    name: 'test',
    message: 'Are you handsome?',
    default: true
  }
])
  .then((answers) => {
    console.log('result:');
    console.log(answers);
  });