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
