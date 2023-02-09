import React, { useEffect, useState } from 'react'
import {
	RouterProps,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom'
import logo from '../logo.svg'
import { Helmet } from 'react-helmet-async'
import './Invite.scss'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	configSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'

import { prompt, alert, snackbar, bindEvent } from '@saki-ui/core'
import { useTranslation } from 'react-i18next'
import { deepCopy } from '@nyanyajs/utils'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { eventTarget } from '../store/config'
import MeowWhisperCoreSDK from '../modules/MeowWhisperCoreSDK'

const SettingsPage = ({ children }: RouterProps) => {
	const { t, i18n } = useTranslation('SettingsPage')
	const dispatch = useDispatch<AppDispatch>()
	const config = useSelector((state: RootState) => state.config)
	const mwc = useSelector((state: RootState) => state.mwc)
	const user = useSelector((state: RootState) => state.user)
	const [openLoginUserDropDownMenu, setOpenLoginUserDropDownMenu] =
		useState(false)
	const [openRegisterUserDropDownMenu, setOpenRegisterUserDropDownMenu] =
		useState(false)

	const [uid, setUid] = useState('')
	const [uidError, setUidError] = useState('')

	const [password, setPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const history = useNavigate()
	const { id } = useParams()
	const [searchParams] = useSearchParams()
	const [type, setType] = useState('')
	const [avatar, setAvatar] = useState('')
	const [nickname, setNickname] = useState('1')
	const [desc, setDesc] = useState('3')

	useEffect(() => {
		let t = searchParams.get('t') === '0' ? 'Contact' : 'Group'
		setType(t)
	}, [])

	useEffect(() => {
		type && mwc.sdk && getInfo()
	}, [type, mwc.sdk])

	const getInfo = async () => {
		console.log(type)
		console.log(avatar, nickname, desc)
		if (type === 'Contact') {
			const res = await mwc.sdk?.api.contact.searchContact({
				uid: id || '',
			})
			console.log('res', res)
		}
	}
	return (
		<>
			<Helmet>
				<title>
					{'邀请你一起聊天 - @ShiinaAiiko - ' +
						t('appTitle', {
							ns: 'common',
						})}
				</title>
			</Helmet>
			<div className={'invite-page ' + config.deviceType}>
				<saki-page-container padding='0 0px'>
					<div slot='main'>
						<saki-page-main align='center' max-width='500px'>
							<div className='scs-main'>
								<div className='csc-m-info'>
									{id}
									{type}
									{searchParams.get('t')}
									<div className='csc-m-i-avatar'>
										<saki-avatar
											border-radius='50%'
											width='100px'
											height='100px'
											nickname={nickname}
											src={avatar}
										></saki-avatar>
									</div>
									<div className='csc-m-i-name'>
										<span>{nickname}</span>
									</div>
									<div className='csc-m-i-desc'>
										<span>{desc}</span>
									</div>
									<div className='csc-m-i-buttons'>
										<saki-button
											height='40px'
											width='200px'
											border-radius='20px'
											type='Primary'
											font-weight='700'
										>
											<span
												style={{
													fontSize: '16px',
													fontWeight: 500,
												}}
											>
												{/* 进入了的就发送消息，没有则加入 */}
												Join
											</span>
										</saki-button>
										<saki-button
											height='40px'
											width='200px'
											border-radius='20px'
											type='Normal'
											margin='10px 0 0 0'
											font-size='18px'
											font-weight='600'
											border='none'
											color='var(--default-color)'
										>
											<span
												style={{
													fontSize: '16px',
													fontWeight: 500,
												}}
											>
												Download App
											</span>
										</saki-button>
									</div>
									{/* <div className='csc-m-i-webapp'>
											Join on web?
											<a href='/'>Launch it now</a>
										</div> */}
								</div>
							</div>
						</saki-page-main>
					</div>
				</saki-page-container>
			</div>
		</>
	)
}

export default SettingsPage
