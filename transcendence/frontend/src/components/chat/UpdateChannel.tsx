import InputField from '../utils/InputField';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';
import { useEffect, useState } from 'react';
import useFetch from '../../customHooks/useFetch';
import cancel from '../../images/cancel.png';
import '../../styles/UpdateChannel.style.css';
import { useHookstate } from '@hookstate/core';
import { group_msg_socket } from '../../stores/chat/chatGroupMsgStore';

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
	setUpdateChannel: (createChan: boolean) => void;
	rightClickedChatId: number | null;
	onClose: () => void;
};

export const UpdateChannel = (props: Props) => {
	const { setUpdateChannel, rightClickedChatId, onClose } = props;
	const [initialData, setInitialData] = useState<any>(null);
	const [channelName, setChannelName] = useState('');
	const [privacyOption, setPrivacyOption] = useState('public');
	const [password, setPassword] = useState('');
	const [nameUnique, setNameUnique] = useState(true);
	const [passwordStrength, setPasswordStrength] = useState(false);
	const { put, get } = useFetch('http://localhost:4000');
	const globalGroupMsgSocket = useHookstate(group_msg_socket);

	useEffect(() => {
		get(`/channels/${rightClickedChatId}`)
			.then((data: any) => {
				setInitialData(data);
				setChannelName(data.name);
				setPassword(data?.password || '');
				if (data.is_public === false) setPrivacyOption('private');
				else {
					if (data?.password) {
						setPrivacyOption('password');
					} else setPrivacyOption('public');
				}
			})
			.catch((e) => console.error(e));
	}, []);
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
		if (channelName?.length > 15) return;
		get('/channels').then((data: any) => {
			console.log(data);
			const isChannelNameUnique = data.find((item: any) => item.name === channelName);
			if (!isChannelNameUnique || initialData.name === isChannelNameUnique?.name)
				setNameUnique(true);
			else setNameUnique(false);
		});

		setChannelName(event.target.value);
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	const handleCancelIcon = () => {
		setUpdateChannel(false);
		setChannelName('');
		setPrivacyOption('public');
		setPassword('');
		setNameUnique(false);
		onClose();
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		let currentUserId: string | number | null = localStorage.getItem('user_id');
		if (currentUserId) currentUserId = parseInt(currentUserId, 10);
		const bodyData = {
			channelId: rightClickedChatId,
			userId: currentUserId,
			updateChannelDto: {
				name: channelName,
				is_public: privacyOption !== 'private',
				password: password,
			},
		};
		console.log('bodyData', bodyData);
		globalGroupMsgSocket.get()?.emit('updateChannel', bodyData);
		setUpdateChannel(false);
		onClose();
	};
	const btnDisabled =
		privacyOption === 'password'
			? channelName === '' || !nameUnique || !passwordStrength
			: channelName === '' || !nameUnique;
	return (
		<div style={{ margin: 'auto' }}>
			<form onSubmit={handleSubmit} className="popup">
				<div className="popup-content">
					<div className="update-channel_title">Update Channel</div>
					<div className="update-channel-name">
						<InputField
							labelTitle="Channel name"
							id="channel-name"
							placeholder="Enter channel name"
							onChange={handleChannelNameChange}
							type="text"
							value={channelName}
						/>
					</div>
					{channelName !== '' && !nameUnique && !(channelName === initialData.name) && (
						<div style={{ color: 'red', margin: '0 10px 20px' }}>Channel Name is not unique!!!</div>
					)}
					<div className="update-channel-privacy">
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
					<div>
						<button
							type="submit"
							className={`submit-update-channel ${btnDisabled ? 'disabled' : ''}`}
							disabled={btnDisabled}
						>
							Save
						</button>
					</div>
					<button type="submit" className="cancel-icon" onClick={handleCancelIcon}>
						<img src={cancel} alt="cancelIcon" />
					</button>
				</div>
			</form>
		</div>
	);
};
