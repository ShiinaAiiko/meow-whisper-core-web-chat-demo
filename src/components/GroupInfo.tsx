import React, { useEffect, useState } from 'react'
import { bindEvent } from '../modules/bindEvent'

import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	configSlice,
	userSlice,
} from '../store'
import './GroupInfo.scss'
import { useTranslation } from 'react-i18next'
import { prompt, alert, snackbar } from '@saki-ui/core'
import { eventTarget } from '../store/config'
import { SyncOff } from './Icon'
import { protoRoot } from '../protos'
import { Query } from '../modules/methods'
import MeowWhisperCoreSDK from '../modules/MeowWhisperCoreSDK'
import { images } from '@nyanyajs/utils'
import md5 from 'blueimp-md5'
import { baseUrl } from '../config'

const GroupInfoComponent = () => {
	const { t, i18n } = useTranslation('modal')
	const config = useSelector((state: RootState) => state.config)
	const contacts = useSelector((state: RootState) => state.contacts)
	const mwc = useSelector((state: RootState) => state.mwc)
	const appStatus = useSelector((state: RootState) => state.config.status)
	const user = useSelector((state: RootState) => state.user)

	const [activeTabLabel, setActiveTabLabel] = useState('')
	const [groupInfo, setGroupInfo] = useState<protoRoot.group.IGroup>()
	const [members, setMembers] = useState<protoRoot.group.IGroupMembers[]>([])
	const [membersLoading, setMembersLoading] = useState('loading')

	const [edit, setEdit] = useState(false)
	const [editLoading, setEditLoading] = useState(false)
	const [name, setName] = useState('')
	const [avatar, setAvatar] = useState<{ base64Url: string; blob: Blob }>()

	const dispatch = useDispatch<AppDispatch>()

	const location = useLocation()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	useEffect(() => {
		if (config.modal.groupId) {
			setActiveTabLabel('')
			getGroupInfo()
			setEdit(false)
		}
	}, [config.modal.groupId])

	const avatarOutput = (src: { base64Url: string; blob: Blob }) => {
		if (!src?.blob) return
		setAvatar(src)
		// 获取Blob
	}
	const updateInfo = async () => {
		setEditLoading(true)
		console.log(avatar, name)
		if (name === groupInfo?.name && !avatar?.base64Url) {
			setEditLoading(false)
			return
		}
		let avatarUrl = groupInfo?.avatar
		if (avatar?.base64Url) {
			const url = await dispatch(
				methods.file.uploadFile({
					file: new File([avatar.blob], md5(groupInfo?.name || '') + '.jpg', {
						type: avatar.blob.type,
					}),
				})
			).unwrap()

			avatarUrl = url + '?x-saass-process=image/resize,160,70'
		}
		const res = await mwc.sdk?.api.group.updateGroupInfo({
			groupId: config.modal.groupId,
			name,
			avatar: avatarUrl,
		})
		console.log('res', res)
		dispatch(
			methods.group.updateGroupInfo({
				groupId: res?.data.groupId || '',
				avatar: res?.data.avatar || '',
				name: res?.data.name || '',
			})
		)
		setEditLoading(false)
		setGroupInfo({
			...groupInfo,
			avatar: res?.data.avatar || '',
			name: res?.data.name || '',
		})
	}
	const getGroupInfo = async () => {
		console.log(config.modal.groupId)

		const res = await mwc.sdk?.api.group.getGroupInfo({
			groupId: config.modal.groupId,
		})
		console.log('getGroupInfo', res)
		if (res?.code === 200 && res?.data?.group) {
			setGroupInfo(res?.data?.group)
			getMembers()
		}
	}

	const getMembers = async () => {
		// if (members?.length !== 0) return
		setMembersLoading('loading')
		// 要改store里的
		const res = await mwc.sdk?.api.group.getGroupMembers({
			groupId: config.modal.groupId,
		})
		console.log('getMembers', res)
		if (res?.code === 200) {
			setMembers(res?.data?.list || [])
		}
		setMembersLoading('noMore')
	}

	// useEffect(() => {
	// 	if (activeTabLabel === 'Members') {
	// 		getMembers()
	// 	}
	// }, [activeTabLabel])

	return (
		<saki-modal
			visible={!!config.modal.groupId}
			width='100%'
			height='100%'
			max-width={config.deviceType === 'Mobile' ? '100%' : '420px'}
			max-height={config.deviceType === 'Mobile' ? '100%' : '560px'}
			mask
			border-radius={config.deviceType === 'Mobile' ? '0px' : ''}
			border={config.deviceType === 'Mobile' ? 'none' : ''}
			mask-closable='false'
			background-color='#fff'
			ref={bindEvent({
				close: () => {
					dispatch(configSlice.actions.setModalGroupId(''))
				},
			})}
		>
			<div className={'group-info-component ' + config.deviceType}>
				<saki-modal-header
					ref={bindEvent({
						close: () => {
							dispatch(configSlice.actions.setModalGroupId(''))
						},
					})}
					close-icon
					title={t('groupInfo')}
				></saki-modal-header>
				<div className='gic-container'>
					<div className='gic-header'>
						<saki-row width='100%' align-items='center'>
							<saki-col span={2}>
								<saki-row align-items='center'>
									<saki-col span={0}>
										{edit ? (
											<saki-avatar
												ref={bindEvent({
													output: (e) => {
														avatarOutput(e.detail)
													},
												})}
												border-radius='50%'
												width='70px'
												height='70px'
												crop-container-width='600px'
												crop-container-height='450px'
												outpur-width='400'
												outpur-height='400'
												output-quality='0.8'
												src={avatar?.base64Url || groupInfo?.avatar || ''}
												nickname={!groupInfo?.avatar ? groupInfo?.name?.toUpperCase() : ''}
												edit-icon
												edit-icon-show-mode={
													avatar?.base64Url || groupInfo?.avatar
														? 'Hover'
														: 'Always'
												}
												crop
											></saki-avatar>
										) : (
											<saki-avatar
												width='70px'
												height='70px'
												border-radius='50%'
												src={avatar?.base64Url || groupInfo?.avatar}
												nickname={!groupInfo?.avatar ? groupInfo?.name : ''}
											></saki-avatar>
										)}
									</saki-col>
									<saki-col padding='0 0 0 10px' span={1}>
										<div className='gic-h-info'>
											{edit ? (
												<saki-input
													ref={bindEvent({
														changevalue: (e) => {
															setName(e.detail)
														},
													})}
													value={name}
													type='Text'
													height='56px'
													placeholder='Group name'
													placeholder-animation='MoveUp'
												></saki-input>
											) : (
												<div className='gic-h-i-nickname text-two-elipsis'>
													{name || groupInfo?.name}
												</div>
											)}

											<div className='gic-h-i-memebers'>
												{members.length} {t('members')}
											</div>
										</div>
									</saki-col>
								</saki-row>
							</saki-col>
							<saki-col justify-content='flex-end' span={0}>
								{user.userInfo.uid === groupInfo?.authorId ? (
									<saki-button
										ref={bindEvent({
											tap: () => {
												if (editLoading) return
												if (edit) {
													setEdit(false)
													updateInfo()
													return
												}
												console.log({
													base64Url: groupInfo?.avatar || '',
													blob: new Blob(),
												})
												setName(groupInfo?.name || '')
												setEdit(true)
												// dispatch(methods.tools.developing())
											},
										})}
										width='50px'
										height='50px'
										loading={editLoading}
										type='CircleIconGrayHover'
									>
										{edit ? (
											<saki-icon
												width='24px'
												height='24px'
												type='Confirm'
												color='#999'
											></saki-icon>
										) : (
											<saki-icon
												width='20px'
												height='20px'
												type='Pen'
												color='#999'
											></saki-icon>
										)}
									</saki-button>
								) : (
									''
								)}
							</saki-col>
						</saki-row>
					</div>
					<saki-tabs
						type='Flex'
						full
						// header-background-color='rgb(245, 245, 245)'
						header-max-width='740px'
						// header-border-bottom='none'
						header-padding='0 10px'
						header-item-min-width='80px'
						active-tab-label={activeTabLabel}
						ref={bindEvent({
							tap: (e) => {
								console.log('changename tap', e)
								setActiveTabLabel(e.detail.label)
								// setOpenDropDownMenu(false)
							},
						})}
					>
						<saki-tabs-item font-size='14px' label='Info' name={t('info')}>
							<saki-scroll-view mode='Inherit'>
								<div className='gic-info-page'>
									<saki-card hide-title hide-subtitle>
										<saki-title
											level='5'
											color='default'
											margin='10px 0 10px 0'
										>
											{t('groupId')}
										</saki-title>
										<div
											ref={
												bindEvent({
													click: () => {
														dispatch(
															methods.tools.copy({
																content: groupInfo?.id || '',
															})
														)
													},
												}) as any
											}
											className='copytext'
										>
											{groupInfo?.id}
										</div>
									</saki-card>
									<saki-row
										margin='30px 0 0 0'
										align-items='center'
										flex-direction='column'
									>
										<saki-col>
											<saki-button
												ref={bindEvent({
													tap: () => {
														dispatch(
															methods.messages.setChatDialogue({
																roomId: groupInfo?.id || '',
																type: 'Group',
																id: groupInfo?.id || '',
																showMessageContainer: true,
																unreadMessageCount: -2,
																sort: -1,
															})
														)
														navigate?.(
															Query(
																'/',
																{
																	roomId: groupInfo?.id || '',
																},
																searchParams
															),
															{
																replace: !!searchParams.get('roomId'),
															}
														)
														dispatch(configSlice.actions.setModalGroupId(''))
													},
												})}
												width='160px'
												padding='8px 0px'
												margin='0 0 0 10px'
												font-size='14px'
												type='Primary'
											>
												{t('sendMessage', {
													ns: 'common',
												})}
											</saki-button>
										</saki-col>
										<saki-col>
											<saki-button
												ref={bindEvent({
													tap: () => {
														dispatch(
															methods.tools.copy({
																content:
																	baseUrl +
																	'/invite/' +
																	groupInfo?.id +
																	'?t=1',
															})
														)
													},
												})}
												width='160px'
												padding='8px 0px'
												margin='10px 0 0 10px'
												font-size='14px'
												type='Normal'
											>
												{t('share', {
													ns: 'common',
												})}
											</saki-button>
										</saki-col>
									</saki-row>
								</div>
							</saki-scroll-view>
						</saki-tabs-item>
						<saki-tabs-item
							font-size='14px'
							label='Members'
							name={t('members')}
						>
							<div className='gic-members-page'>
								<saki-row align-items='center' padding='4px 10px 4px 20px'>
									<saki-col>
										<saki-title level='4' color='default'>
											{members.length} {t('members')}
										</saki-title>
									</saki-col>
									<saki-col justify-content='flex-end'>
										<saki-button
											ref={bindEvent({
												tap: () => {
													dispatch(methods.tools.developing())
												},
											})}
											type='CircleIconGrayHover'
										>
											<saki-icon
												width='16px'
												height='16px'
												type='AddUser'
												color='#999'
											></saki-icon>
										</saki-button>
									</saki-col>
								</saki-row>
								<div
									style={{
										width: '100%',
										height: 'calc(100% - 44px)',
									}}
								>
									<saki-scroll-view mode='Inherit'>
										<saki-chat-layout-contact>
											{members.map((v, i) => {
												return (
													<saki-chat-layout-contact-item
														ref={bindEvent({
															tap: () => {
																dispatch(
																	configSlice.actions.setModalUserId(
																		v.userInfo?.uid || ''
																	)
																)
															},
														})}
														key={i}
														padding='10px 20px'
														avatar-size='36px'
														avatar-text={
															!v.userInfo?.avatar ? v.userInfo?.nickname : ''
														}
														avatar={v.userInfo?.avatar}
														nickname={v.userInfo?.nickname}
														margin='0'
														nickname-font-size='14px'
														username-font-size='13px'
														hover-background-color='rgba(247,247,247)'
														username={
															(v?.userInfo?.lastSeenTime || 0) > 0
																? MeowWhisperCoreSDK.methods.getLastSeenTime(
																		Number(v?.userInfo?.lastSeenTime) || 0
																  )
																: ''
														}
														display-icons-layout-width='auto'
														last-message-time={''}
													></saki-chat-layout-contact-item>
												)
											})}
										</saki-chat-layout-contact>
										<saki-scroll-loading
											language={i18n.language}
											type={membersLoading}
										></saki-scroll-loading>
									</saki-scroll-view>
								</div>
							</div>
						</saki-tabs-item>
						<saki-tabs-item
							font-size='14px'
							label='Settings'
							name={t('settings')}
						>
							<saki-scroll-view mode='Inherit'>
								<div className='gic-settings-page'>
									<saki-row
										margin='10px 0 0 0'
										align-items='center'
										flex-direction='column'
									>
										<saki-col>
											<saki-button
												ref={bindEvent({
													tap: () => {
														if (user.userInfo.uid === groupInfo?.authorId) {
															dispatch(
																methods.group.disbandGroup({
																	groupId: String(groupInfo?.id),
																})
															)
														} else {
															dispatch(
																methods.group.leaveGroup({
																	groupId: String(groupInfo?.id),
																})
															)
														}
													},
												})}
												width='160px'
												padding='8px 0px'
												margin='10px 0 0 10px'
												font-size='14px'
												color='var(--saki-default-color)'
												type='Normal'
											>
												{user.userInfo.uid === groupInfo?.authorId
													? t('disband', {
															ns: 'common',
													  })
													: t('leave', {
															ns: 'common',
													  })}
											</saki-button>
										</saki-col>
									</saki-row>
									<div className='gic-s-buttons'></div>
								</div>
							</saki-scroll-view>
						</saki-tabs-item>
					</saki-tabs>
				</div>
			</div>
		</saki-modal>
	)
}

export default GroupInfoComponent
