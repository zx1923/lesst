const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("What`s your name ?  ", function (answer) {
  console.log("name is " + answer);
  rl.close();
});

rl.on("close", function () {
  process.exit(0);
});