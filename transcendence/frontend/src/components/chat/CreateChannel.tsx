import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InputField from '../utils/InputField';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import useFetch from '../../customHooks/useFetch';
import { useHookstate } from '@hookstate/core';
import userInfo from '../../stores/chat/store';
import { io } from 'socket.io-client';
import { group_msg_data, group_msg_socket } from '../../stores/chat/chatGroupMsgStore';

type PropsChannelMode = {
	privacyOption: string;
	setPrivacyOption: (str: string) => void;
};

const ChannelMode = ({ privacyOption, setPrivacyOption }: PropsChannelMode) => {
	return (
		<label>
			Privacy : {`  `}
			<select value={privacyOption} onChange={(e) => setPrivacyOption(e.target.value)}>
				<option value="public">Public</option>
				<option value="private">Private</option>
				<option value="password">Password-Protected</option>
			</select>
		</label>
	);
};

type Props = {
	setCreateChannel: (createChan: boolean) => void;
};

export const CreateChannel = (props: Props) => {
	const { setCreateChannel } = props;
	const [channelName, setChannelName] = useState('');
	const [privacyOption, setPrivacyOption] = useState('public');
	const [password, setPassword] = useState('');
	const [nameUnique, setNameUnique] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(false);
	const { post, get } = useFetch('http://localhost:4000');
	const globalUserInfo = useHookstate(userInfo);
	const globalGroupMsgSocket = useHookstate(group_msg_socket);
	// const [createChanSocket, setCreateChanSocket] = useState<any>(null);
	// const globalGroupMsgData = useHookstate(group_msg_data);
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	// useEffect(() => {
	// 	globalGroupMsgSocket.get()?.on('channelCreated', (data: any) => {
	// 		console.log('creatttted chanel data:', data);
	// 		// globalGroupMsgData.set((prev: any) => [...prev, data]);
	// 		// console.log('globalGroupMsgData.get()', globalGroupMsgData.get());
	// 	});
	// 	globalGroupMsgSocket.get()?.on('createChannelError', (data: any) => {
	// 		console.error('error happen:', data);
	// 	});
	// }, [globalGroupMsgSocket.get()]);

	useEffect(() => {
		setPassword('');
	}, [privacyOption]);
	const handleChannelNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const channelName = event.target.value;
		if (!channelName) {
			setChannelName('');
			setNameUnique(false);
			return;
		}
		if (channelName.length > 15) return;
		get('/channels').then((data: any) => {
			console.log(data);
			const isChannelNameUnique = data.filter((item: any) => item.name === channelName);
			if (isChannelNameUnique.length === 0) setNameUnique(true);
			else setNameUnique(false);
		});

		setChannelName(event.target.value);
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	const handleCancelIcon = () => {
		setCreateChannel(false);
		setChannelName('');
		setPrivacyOption('public');
		setPassword('');
		setNameUnique(false);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const bodyData = {
			name: channelName,
			is_public: privacyOption !== 'private',
			password: password,
			owner_id: currentUserId,
		};
		globalGroupMsgSocket.get()?.emit('createChannel', bodyData);

		// const res = await post('/channels', {
		// 	name: channelName,
		// 	is_public: privacyOption !== 'private',
		// 	password: password,
		// 	owner_id: currentUserId,
		// });
		// console.log(res);
		setCreateChannel(false);
	};
	const btnDisabled =
		privacyOption === 'password'
			? channelName === '' || !nameUnique || !passwordStrength
			: channelName === '' || !nameUnique;
	console.log(btnDisabled);
	return (
		<div className="left-side" data-globaluserinfo={globalUserInfo.get()}>
			<form onSubmit={handleSubmit}>
				<div className="sidebar-header">
					<div className="back-arrow" onClick={handleCancelIcon}>
						<FontAwesomeIcon icon={faArrowLeft} />
					</div>
					<div className="new-channel_title">New Channel</div>
				</div>
				<div className="create-channel-name">
					<InputField
						labelTitle="Create channel"
						id="channel-name"
						placeholder="Enter channel name"
						onChange={handleChannelNameChange}
						type="text"
						value={channelName}
					/>
				</div>
				{channelName?.length > 15 && (
					<div style={{ color: 'red', margin: '0 10px 20px' }}>
						Channel Name maximum 15 character allowed!!!
					</div>
				)}
				{channelName !== '' && !nameUnique && (
					<div style={{ color: 'red', margin: '0 10px 20px' }}>Channel Name is not unique!!!</div>
				)}
				<div className="create-chan-priv">
					<ChannelMode privacyOption={privacyOption} setPrivacyOption={setPrivacyOption} />
					{privacyOption === 'password' && (
						<div className="create-password">
							<InputField
								labelTitle="Password"
								id="create-pass"
								placeholder="Enter password"
								onChange={handlePasswordChange}
								type="password"
								value={password}
							/>
							<PasswordStrengthIndicator
								password={password}
								setPasswordStrength={setPasswordStrength}
							/>
						</div>
					)}
				</div>
				<div className="create-channel">
					<button type="submit" disabled={btnDisabled}>
						<FontAwesomeIcon icon={faArrowRight} />
					</button>
				</div>
			</form>
		</div>
	);
};
