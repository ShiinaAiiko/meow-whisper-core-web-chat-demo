import {
	BrowserWindow,
	ipcMain,
	Tray,
	Notification,
	nativeTheme,
	globalShortcut,
	dialog,
	SaveDialogOptions,
	OpenDialogOptions,
} from 'electron'
import path from 'path'
import fs from 'fs'
import moment from 'moment'
import * as nyanyalog from 'nyanyajs-log'

import { logo, systemConfig } from '../config'
import { exec } from 'child_process'
import AutoLaunch from 'auto-launch'
import { t } from './languages'
export const autoLauncher = new AutoLaunch({
	name: t('appName'),
	// path: '/Applications/Minecraft.app',
})
interface SaveAsOptions extends SaveDialogOptions {
	path?: string
}
export const saveAs = async (
	fileName: string,
	data: string,
	options?: SaveAsOptions
) => {
	const lastOpenFolderPath =
		(await systemConfig.get('lastOpenFolderPath')) ||
		process.env.HOME ||
		process.env.USERPROFILE
	const savePath = await dialog.showSaveDialog({
		defaultPath: (options?.path || lastOpenFolderPath) + '/' + fileName,
		...options,
		properties: [
			'showHiddenFiles',
			'showOverwriteConfirmation',
			'createDirectory',
		],
	})
	if (!savePath.canceled && savePath?.filePath) {
		await systemConfig.set(
			'lastOpenFolderPath',
			path.dirname(savePath.filePath)
		)
		// nyanyalog.info(savePath.canceled, savePath.filePath)
		// nyanyalog.info(path.dirname(savePath.filePath))
		fs.writeFileSync(savePath?.filePath, data)
	}
}

interface OpenFolderOptions extends OpenDialogOptions {}
export const openFolder = async (path: string, options?: OpenFolderOptions) => {
	const lastOpenFolderPath =
		path || (process.env.HOME || process.env.USERPROFILE) + '/meow-sticky-note'
	const openPath = await dialog.showOpenDialog({
		defaultPath: lastOpenFolderPath,
		...options,
		properties: ['showHiddenFiles', 'openDirectory', 'createDirectory'],
	})
	if (!openPath.canceled && openPath?.filePaths) {
		return openPath?.filePaths?.[0]
	}
	return ''
}

const mkdirsSync = (dirname: string) => {
	if (fs.existsSync(dirname)) {
		return true
	} else {
		if (mkdirsSync(path.dirname(dirname))) {
			fs.mkdirSync(dirname)
			return true
		}
	}
}

const removeDir = (dir: string) => {
	let files = fs.readdirSync(dir)
	for (var i = 0; i < files.length; i++) {
		let newPath = path.join(dir, files[i])
		let stat = fs.statSync(newPath)
		if (stat.isDirectory()) {
			//?????????????????????????????????
			removeDir(newPath)
		} else {
			//????????????
			fs.unlinkSync(newPath)
		}
	}
	fs.rmdirSync(dir) //????????????????????????????????????????????????
}

export const openURL = (url: string) => {
	// ????????????
	switch (process.platform) {
		// Mac ??????open
		case 'darwin':
			exec('open ' + url)
			break
		// Windows??????start
		case 'win32':
			exec('start ' + url)
			break
		// Linux?????????xdg-open
		default:
			exec('xdg-open ' + url)
	}
}
