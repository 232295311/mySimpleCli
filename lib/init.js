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
