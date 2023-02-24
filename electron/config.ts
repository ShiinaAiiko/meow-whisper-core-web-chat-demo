import {
	BrowserWindow,
	nativeImage,
	Tray,
	ipcMain,
	nativeTheme,
} from 'electron'
import { NodeFsStorage, electronRouter } from '@nyanyajs/utils/dist/node'

import path from 'path'
import isDev from 'electron-is-dev'
import * as nyanyalog from 'nyanyajs-log'
import { appTray, getMenu } from './modules/taskMenu'
import { t } from './modules/languages'
import { osLocale } from 'os-locale'

import { name } from './package.json'

nyanyalog.config({
	format: {
		function: {
			fullFunctionChain: false,
		},
		prefixTemplate: '[{{Timer}}] [{{Type}}] [{{File}}]@{{Name}}',
	},
})

// 自动获取本机目录
export let userHome = process.env.HOME || process.env.USERPROFILE
const cacheRootDir = userHome + '/.cache'
const configRootDir = userHome + '/.config'
// 'mode' | 'language'

// export const taskIcon = path.join(
// 	path.join(__dirname, '../../../public'),
// 	'logo-white-bg.png'
// )
nyanyalog.info('isDev', isDev)
nyanyalog.info('__dirname', __dirname)
// const { exec } = require('child_process')
// // 输出当前目录（不一定是代码所在的目录）下的文件和文件夹
// exec('ls', (err: any, stdout: any, stderr: any) => {
// 	if (err) {
// 		console.log(err)
// 		return
// 	}
// 	console.log(`stdout: ${stdout}`)
// 	console.log(`stderr: ${stderr}`)
// })
// exec('cd .. && ls', (err: any, stdout: any, stderr: any) => {
// 	if (err) {
// 		console.log(err)
// 		return
// 	}
// 	console.log(`stdout: ${stdout}`)
// 	console.log(`stderr: ${stderr}`)
// })

let staticPath = isDev ? '../../public' : '../build'

export const logo64 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/64x64.png')
)
export const logo128 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/128x128.png')
)
export const logo256 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/256x256.png')
)
export const logo512 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/512向12.png')
)
export const logo1024 = nativeImage.createFromPath(
	path.join(path.join(__dirname, staticPath), '/icons/1024x1024.png')
)
export const logo = path.join(path.join(__dirname, staticPath), '/icons/256x256.png')


let labelPrefix = isDev ? 'dev_' : ''

export const systemConfig = new NodeFsStorage<any>({
	label: labelPrefix + 'systemConfig',
	cacheRootDir: configRootDir + '/' + name + '/s',
	// encryption: {
	// 	enable: false,
	// 	key: 'meow-sticky-note',
	// },
})
// export const notes = new NodeFsStorage<any>({
// 	label: labelPrefix + 'notes',
// 	cacheRootDir: cacheRootDir + '/' + name + '/u',
// })
export const global = new NodeFsStorage<any>({
	label: labelPrefix + 'global',
	cacheRootDir: cacheRootDir + '/' + name + '/u',
})

export let languages = 'en-US'
export let supportLanguages = ['en-US', 'zh-CN', 'zh-TW']
export const setLanguages = async () => {
	languages = await systemConfig.get('language')
	let locale = Intl.DateTimeFormat().resolvedOptions().locale
	if (languages === 'system') {
		languages = supportLanguages.includes(locale) ? locale : 'en-US'
	}
	appTray.setToolTip(t('appName'))
	appTray.setContextMenu(getMenu())
}

export const initConfig = async () => {
	NodeFsStorage.baseRootDir = cacheRootDir + "'/meow-sticky-note/u'"

	languages = await systemConfig.getAndSet('language', (v) => {
		return v ? v : 'en-US'
	})
	await systemConfig.getAndSet('mode', (v) => {
		return v ? v : 'system'
	})
	// const userConfig = new NodeFsStorage<string, any>({
	// 	baseLabel: 'userConfig',
	// 	cacheRootDir: configRootDir + '/meow-sticky-note/u',
	// 	encryption: {
	// 		enable: false,
	// 		key: 'meow-sticky-note',
	// 	},
	// })
	// console.log(userConfig)

	// userConfig.set('language', 'zh-CN')

	electronRouter(ipcMain)
}
