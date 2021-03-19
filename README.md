# 自己实现一个简易的cli工具

- 从零构建一个cli工具
  - command命令行
  - 模板库代码拉取
  - 安装依赖
  - 启动服务
  - 打开浏览器
  - vue约定路由功能（增加一个vue文件,自动配置路由入口和菜单）
  - npm库上传

## 新建项目

mkdir -> npm init-y->安装依赖

` npm i commander download-git-repo ora handlebars -s`

``` js
./bin/kkb.js
#!/usr/bin/env node
// 通过这样一句话去指定该代码使用node去执行

console.log('测试')
```

```js
 //package.json新增
 "bin": {
    "kkb": "./bin/kkb.js"
  },
```

执行 `npm link`，现在我们在控制台直接输入kkb就可以运行到对应的js文件啦

![image-20210318200743860](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210318200743860.png)

## 定制命令行界面

类似 vue create xxx 我们要实现一个 kkb init xxx 怎么去实现？

```js
#!/usr/bin/env node
const program = require('commander')

// 第一行 定义kkb-V 时的版本~同package.json中
program.version(require('../package').version)

//description定义一个描述 action定义他实际做的事情
program
	.command('init <name>')
	.description('init project')
	.action((name) => {
		console.log('init' + name)
	})

//执行的时候 执行参数全在argv中
program.parse(process.argv)

```

![image-20210318201618781](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210318201618781.png)

##  让cli界面好看起来

### 安装依赖

`npm i figlet clear chalk ora open -s`

```js
// lib文件夹放各种处理的函数 ./lib/init.js
// promisify 可以把一些异步回调的方法转为promise类型，这样我们就可以用async await了
const { promisify } = require('util')
const figlet = promisify(require('figlet')) //可以输出一些特殊的文字
const clear = require('clear') //可以清空命令行页面
const chalk = require('chalk') //粉笔库 更换日志的颜色
const log = (content) => console.log(chalk.green(content)) //绿色日志

module.exports = async (name) => {
	// 打印欢迎页面
	clear()
	const data = await figlet('KKB Welcome')
	log(data)
}

```



![image-20210318202817231](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210318202817231.png)

## 克隆脚手架

类比vue-cli，我们也要实现在kkb init abcd的指令后，能生成一个项目文件夹。

```js
const { promisify } = require('util')
const figlet = promisify(require('figlet')) //可以输出一些特殊的文字
const clear = require('clear') //可以清空命令行页面
const chalk = require('chalk') //粉笔库 更换日志的颜色
const log = (content) => console.log(chalk.green(content)) //绿色日志
const { clone } = require('./download')
module.exports = async (name) => {
	// 打印欢迎页面
	clear()
	const data = await figlet('KKB Welcome')
	log(data)
	log(`🚀🚀🚀创建项目：` + name)
	await clone('github:232295311/vue-template-toCli', name)
}
```



```js
//download.js
const { promisify } = require('util')
module.exports.clone = async (repo, desc) => {
	const download = promisify(require('download-git-repo'))
	const ora = require('ora') //进度条
	const process = ora(`下载...${repo}`)
	process.start()
	await download(repo, desc, { clone: true })
	// await new Promise((resolve) => {
	// 	setTimeout(() => {
	// 		resolve()
	// 	}, 2000)
	// })
	process.succeed()
}



```

![image-20210318211326061](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210318211326061.png)

这样子之后，我们的当前目录下就存在一个test文件夹啦

## 启动项目之自动安装依赖

下载完vue模板后，我们应该自动给他npm install一下安装依赖对不~

```js
const spawn = async (...args) => {
  const { spawn } = require("child_process"); //原生包的子进程
  return new Promise((resolve) => {
    const proc = spawn(...args);
    proc.stdout.pipe(process.stdout); //子进程的输出流与主进程相对接  为了打印子进程的日志
    proc.stderr.pipe(process.stderr); //错误流
    proc.on("close", () => {
      resolve();
    });
  });
};

```

然后再引入到 init 里。

注意的是：window10 中，在 spawn 中执行 npm 报错 [Error: spawn ENOENT]” errors。解决方法是：加入的判断process.platform === "win32" ? "npm.cmd" : "npm"

```js
module.exports = async (name) => {
  ...
 // 3. 自动安装依赖
  //npm：要执行的命令，可以是cnpm...
  //  * []:所有参数放数组中
  //  * cwd: 在哪个目录下执行命令
  spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], { cwd: `./${name}` });
   log(`
    ?安装完成：
    ==============
    cd ${name}
    npm run dev
    ==============
    `);
};

```

![image-20210318221602742](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210318221602742.png)

![image-20210319110000582](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210319110000582.png)

## 自动启动项目

```js
const open = require('open')
module.exports = async (name) => {
    。。。。
	open('http://localhost:8080')
	await spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'serve'], { cwd: `./${name}` })
}
```



## 最终的init.js

```js
// lib文件夹放各种处理的函数
// promisify 可以把一些异步回调的方法转为promise类型，这样我们就可以用async await了
const { promisify } = require('util')
const figlet = promisify(require('figlet')) //可以输出一些特殊的文字
const clear = require('clear') //可以清空命令行页面
const chalk = require('chalk') //粉笔库 更换日志的颜色
const log = (content) => console.log(chalk.green(content)) //绿色日志
const { clone } = require('./download')

const spawn = async (...args) => {
	const { spawn } = require('child_process') //原生包的子进程
	return new Promise((resolve) => {
		const proc = spawn(...args)
		proc.stdout.pipe(process.stdout) //子进程的输出流与主进程相对接  为了打印子进程的日志
		proc.stderr.pipe(process.stderr) //错误流
		proc.on('close', () => {
			resolve()
		})
	})
}
const open = require('open')

module.exports = async (name) => {
	// 打印欢迎页面
	clear()
	const data = await figlet('KKB Welcome')
	log(data)
	log(`创建项目：` + name)
	await clone('github:232295311/vue-template-toCli', name)
	await spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install'], {
		cwd: `./${name}`,
	}) //指令,参数,options
	log(`
安装完成
To get Start
======================= 
    cd ${name}
    npm run serve
=======================
`)
	open('http://localhost:8080')
	await spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'serve'], { cwd: `./${name}` })
}

```

![image-20210319110816535](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210319110816535.png)

![image-20210319110911190](C:\Users\hasee\AppData\Roaming\Typora\typora-user-images\image-20210319110911190.png)