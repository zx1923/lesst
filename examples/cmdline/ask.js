
const readline = require('readline');

//创建readline接口实例
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// question方法
rl.question("What`s your name ?  ", function (answer) {
  console.log("name is " + answer);
  // 不加close，则不会结束
  rl.close();
});

// close事件监听
rl.on("close", function () {
  // 结束程序
  process.exit(0);
});