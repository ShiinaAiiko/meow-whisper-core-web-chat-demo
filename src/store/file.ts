import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams, methods, RootState } from '.'
import { PARAMS, protoRoot } from '../protos'
import { WebStorage, SakiSSOClient, RunQueue } from '@nyanyajs/utils'
import { MeowWhisperCoreSDK } from '../modules/MeowWhisperCoreSDK'
import { meowWhisperCore, sakisso } from '../config'
import { userAgent } from './user'
import { SAaSS } from './config'
import { storage } from './storage'
import { snackbar } from '@saki-ui/core'
import { FriendItem } from './contacts'
import createSocketioRouter from '../modules/socketio/router'
import { GroupCache } from './group'
import { CustomStickersItem } from './emoji'

export const modeName = 'file'
// export let meowWhisperCoreSDK: MeowWhisperCoreSDK | undefined
const state: {} = {}
export const fileSlice = createSlice({
	name: modeName,
	initialState: state,
	reducers: {},
})

export const fileQueue = new RunQueue()

export const fileMethods = {
	uploadFile: createAsyncThunk<
		string,
		{ file: File },
		{
			state: RootState
		}
	>(modeName + '/uploadFile', ({ file }, thunkAPI) => {
		return new Promise(async (resolve, reject) => {
			const { config, mwc } = thunkAPI.getState()
			const { getHash, uploadFile } = SAaSS
			let reader = new FileReader()
			reader.onload = async (e) => {
				if (!e.target?.result) return
				const hash = getHash(e.target.result)
				// console.log('hash', hash)
				// console.log('file', file)
				const res = await mwc.sdk?.api.file.getUploadFileToken({
					fileInfo: {
						name: file.name,
						size: file.size,
						type: file.type,
						suffix: '.' + file.name.substring(file.name.lastIndexOf('.') + 1),
						lastModified: file.lastModified,
						hash: hash,
					},
				})
				console.log('getUploadToken', res)
        if (res?.code === 200) {
					//         apiUrl: "http://192.168.0.106:16100/api/v1/chunkupload/upload"
					// chunkSize: 262144
					// token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaWxlSW5mbyI6eyJBcHBJZCI6IjFlODE2OTE0LTY0ZDItNDc3YS04ZTM1LTQyN2Q5NDdlY2Y1MCIsIk5hbWUiOiJQbmdJdGVtXzEyMTExMDgucG5nIiwiRW5jcnlwdGlvbk5hbWUiOiI4NmZlYmJhNTdiY2NkOGExODNhMTkyZWM2OTRmNzUzNSIsIlBhdGgiOiIvRjA5MzVFNENENTkyMEFBNkM3Qzk5NkE1RUU1M0E3MEYvZmlsZXMvIiwiVGVtcEZvbGRlclBhdGgiOiIuL3N0YXRpYy9jaHVjay8wMzJhYzZhMjQ2ZWI3ZTUxZTM3Mzc3YzNhYmE4YjM2NzE1NGZiMTUxMDFhOTI3NzY2NDA0MDRlMDlhZjkwMGJkLyIsIlRlbXBDaHVja0ZvbGRlclBhdGgiOiIuL3N0YXRpYy9jaHVjay8wMzJhYzZhMjQ2ZWI3ZTUxZTM3Mzc3YzNhYmE4YjM2NzE1NGZiMTUxMDFhOTI3NzY2NDA0MDRlMDlhZjkwMGJkLy9jaHVjay8iLCJDaHVua1NpemUiOjEzMTA3MiwiQ3JlYXRlVGltZSI6MTY1OTg5NDkwNCwiRXhwaXJhdGlvblRpbWUiOi0xLCJWaXNpdENvdW50IjotMSwiRmlsZUluZm8iOnsiTmFtZSI6IlBuZ0l0ZW1fMTIxMTEwOCIsIlNpemUiOjExMjAyLCJUeXBlIjoiaW1hZ2UvcG5nIiwiU3VmZml4IjoiLnBuZyIsIkxhc3RNb2RpZmllZCI6MTY1OTgxMzE3NjY0MSwiSGFzaCI6IjAzMmFjNmEyNDZlYjdlNTFlMzczNzdjM2FiYThiMzY3MTU0ZmIxNTEwMWE5Mjc3NjY0MDQwNGUwOWFmOTAwYmQifSwiRmlsZUNvbmZsaWN0IjoiUmVwbGFjZSJ9LCJleHAiOjE2NTk5ODEzMDQsImlzcyI6InNhYXNzIn0.nfwmBNpJAMCK31U_vG4dL3mRvkhKb7EnaAqji29X9Hw"
					// uploadedOffset: []
					// urls: Urls
					// domainUrl: "http://192.168.0.106:16100"
					// encryptionUrl: "/s/86febba57bccd8a183a192ec694f7535"
					// url: "/s/F0935E4CD5920AA6C7
					const data: any = res.data
					if (data.token) {
						uploadFile({
							file: file,
							url: data.apiUrl,
							token: data.token,
							chunkSize: data.chunkSize,
							uploadedOffset: data.uploadedOffset || [],
							uploadedTotalSize: data.uploadedTotalSize || 0,

							async onprogress(options) {
								console.log(options)
								// await store.state.storage.staticFileWS.getAndSet(
								// 	upload.data.urls?.encryptionUrl || '',
								// 	async (v) => {
								// 		return {
								// 			...v,
								// 			fileDataUrl: result || '',
								// 			uploadedSize: options.uploadedSize,
								// 			totalSize: options.totalSize,
								// 		}
								// 	}
								// )
							},
							async onsuccess(options) {
								console.log(options)
								resolve(data.urls?.domainUrl + options.shortUrl)
								// await store.state.storage.staticFileWS?.getAndSet(
								// 	upload.data.urls?.encryptionUrl || '',
								// 	async (v) => {
								// 		return {
								// 			...v,
								// 			fileDataUrl: result || '',
								// 			encryptionUrl: options.encryptionUrl,
								// 			url: options.url,
								// 			uploadedSize: file.size,
								// 			totalSize: file.size,
								// 		}
								// 	}
								// )
								// store.dispatch('chat/sendMessageWidthSecretChatApi', {
								// 	messageId,
								// 	dialogId,
								// })
							},
							onerror(err) {
								console.log('error', err)
								// store.dispatch('chat/failedToSendMessage', {
								// 	messageId,
								// 	dialogId,
								// })
							},
						})
					} else {
						resolve(data.urls?.domainUrl + res.data.urls?.shortUrl)
					}
				}
			}
			reader.readAsArrayBuffer(file)
		})
	}),
	uploadCustomStickersFile: createAsyncThunk<
		string,
		{
			cs: CustomStickersItem[]
		},
		{
			state: RootState
		}
	>(modeName + '/uploadCustomStickersFile', ({ cs }, thunkAPI) => {
		return new Promise(async (resolve, reject) => {
			const { config, mwc, user } = thunkAPI.getState()
			const { getHash, uploadFile } = SAaSS

			// console.log('uploadCustomStickersFile', cs)
			const blob = new Blob([
				JSON.stringify({
					list: cs,
				}),
			])
			const file = new File(
				[blob],
				md5(user.userInfo.uid + '_CustomStickers') + '.json',
				{
					type: 'application/json',
				}
			)
			// console.log(file)
			let reader = new FileReader()
			reader.onload = async (e) => {
				if (!e.target?.result) return
				const hash = getHash(e.target.result)
				// console.log('hash', hash)
				// console.log('file', file)

				const res = await mwc.sdk?.api.file.getCustomStickersUploadFileToken({
					size: file.size,
					hash,
				})
				// console.log('getCustomStickersUploadFileToken', res)
				if (res?.code === 200) {
					const data: any = res.data
					if (data.token) {
						uploadFile({
							file: file,
							url: data.apiUrl,
							token: data.token,
							chunkSize: data.chunkSize,
							uploadedOffset: data.uploadedOffset || [],
							uploadedTotalSize: data.uploadedTotalSize || 0,

							async onprogress(options) {
								// console.log(options)
							},
							async onsuccess(options) {
								// console.log(options)
								resolve(data.urls?.domainUrl + options.shortUrl)
							},
							onerror(err) {
								console.log('error', err)
							},
						})
					} else {
						resolve(data.urls?.domainUrl + res.data.urls?.shortUrl)
					}
				}
			}

			reader.readAsArrayBuffer(file)
		})
	}),
}
