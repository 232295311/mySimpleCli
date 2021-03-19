#!/usr/bin/env node
const program = require('commander')

// 第一行 定义kkb-V 时的版本~同package.json中
program.version(require('../package').version)

//description定义一个描述 action定义他实际做的事情
program
	.command('init <name>')
	.description('init project')
	.action(require('../lib/init'))

//执行的时候 执行参数全在argv中
program.parse(process.argv)
