import {
	BrowserWindow,
	BrowserWindowConstructorOptions,
	globalShortcut,
	Tray,
	app,
	Menu,
	screen,
	MenuItem,
} from 'electron'
import path from 'path'

import isDev from 'electron-is-dev'
import * as nyanyalog from 'nyanyajs-log'

import { Route } from '../typings/api'
import { logo1024, logo, systemConfig } from '../config'

export const windows = new Map<Route, BrowserWindow>()

export interface BrowserWindowOPtions extends BrowserWindowConstructorOptions {
	visible: boolean
}

export const createWindow = async (
	route: Route,
	options: BrowserWindowOPtions
) => {
	let x = await systemConfig.get(route + 'x')
	let y = await systemConfig.get(route + 'y')
	let w = await systemConfig.get(route + 'w')
	let h = await systemConfig.get(route + 'h')
	console.log(route + ' => x :', x)
	console.log(route + ' => y :', y)
	console.log(route + ' => w :', w)
	console.log(route + ' => h :', h)

	const window = new BrowserWindow({
		...options,
		webPreferences: {
			...options.webPreferences,
			devTools: true,
		},
		icon: logo1024,
	})

	if (process.platform === 'darwin') {
		app.dock.setIcon(logo1024)
	}

	// console.log(1212121212)
	// console.log(
	// 	screen.getPrimaryDisplay().workAreaSize.width,
	// 	screen.getPrimaryDisplay().workAreaSize.height
	// )
	if (!x) {
		window.center()
	} else {
		let sw = screen.getPrimaryDisplay().workAreaSize.width
		let sh = screen.getPrimaryDisplay().workAreaSize.height
		if (x > sw || h > sh || x < 0 || h < 0) {
			window.center()
		} else {
			window.setPosition(x, y)
		}
	}
	if (w && h) {
		window.setSize(w, h)
	}
	if (options.visible) {
		window.show()
	} else {
		window.hide()
	}
	const queryStr = '?route=' + route + '&time=' + new Date().getTime()
	let dev = isDev
	// dev = false
	// window.loadURL('http://localhost:16111' + route + queryStr)
	// window.loadURL(
	// 	dev
	// 		? 'http://localhost:16111' + route + queryStr
	// 		: `file://${path.join(__dirname, '../build/index.html')}` + queryStr,
	// 	{ extraHeaders: 'pragma: no-cache' }
	// )
	// console.log(`file://${path.join(__dirname, '../../../build/index.html')}`)
	window.loadURL(
		dev
			? 'http://localhost:15311' + route + queryStr
			: `file://${path.join(__dirname, '../../build/index.html')}#${route}` +
					queryStr,
		{ extraHeaders: 'pragma: no-cache' }
	)
	window.webContents.openDevTools()
	setTimeout(() => {
		if (options?.webPreferences?.devTools) {
			window.webContents.openDevTools()
		} else {
			window.webContents.closeDevTools()
		}
	})
	window.on('show', () => {
		console.log('show')
	})
	window.on('focus', () => {
		// nyanyalog.info('focus')
		window.webContents.send('focus')
	})
	window.on('blur', () => {
		// nyanyalog.info('blur')
		window.webContents.send('blur')
	})
	window.on('close', (e: any) => {
		console.log('close', e, app['isQuit'])
		// windows.delete(route)
		if (!app['isQuit']) {
			e.preventDefault()
			window?.hide()
			return false
		}
	})
	window.on('move', async (e: any) => {
		const [x, y] = window.getPosition()
		await systemConfig.set(route + 'x', x)
		await systemConfig.set(route + 'y', y)
	})
	window.on('resize', async (e: any) => {
		const [w, h] = window.getSize()
		await systemConfig.set(route + 'w', w)
		await systemConfig.set(route + 'h', h)
	})
	window.setMenu(null)
	windows.set(route, window)
	return window
}
const menu = new Menu()
menu.append(
	new MenuItem({
		label: 'Electron',
		submenu: [
			{
				role: 'help',
				accelerator:
					process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
				click: () => {
					console.log('Electron rocks!')
				},
			},
		],
	})
)

export const openMainWindows = async () => {
	let window = windows.get('/')
	if (window) {
		window.show()
		// window.focus()
		window.webContents.send('show')
		return window
	}
	return await createWindow('/', {
		title: 'Meow Sticky Note',
		width: 1120,
		height: 780,
		// x: 0,
		// y: 0,
		skipTaskbar: false,
		hasShadow: true,
		alwaysOnTop: false,
		fullscreen: false,
		// center: true,
		// 可以隐藏窗口
		frame: true,
		// backgroundColor: 'rgba(0,0,0,0.3)',

		webPreferences: {
			devTools: false,
			nodeIntegration: true,
			contextIsolation: false,
		},
		visible: true,
	})
}
