import '../../styles/Chat.Content.style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faGamepad, faPaperPlane, faSmile } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';

import EmojiPicker, { EmojiStyle, EmojiClickData } from 'emoji-picker-react';
import { useHookstate } from '@hookstate/core';
import userInfo from '../../stores/chat/store';
import useFetch from '../../customHooks/useFetch';
import activeTab from '../../stores/chat/chatTabsStore';
import moment from 'moment';
import { MyLoader } from '../utils/Loader';
import { useNavigate } from 'react-router-dom';
import { direct_msg_data, direct_msg_socket } from '../../stores/chat/chatDirectMsgStore';
import { message_socket } from '../../stores/notifications/Message.store';
import { channel_membership_data } from '../../stores/chat/channelMembershipStore';
import { group_msg_socket } from '../../stores/chat/chatGroupMsgStore';
import { glbIsInviting } from '../../stores/game/isInvitingStore';
import { useGameSocket } from '../../customContexts/gameSocketContext';
import { gameState } from '../../stores/game/gameStore';

// define the props
type RenderContentProps = {
	value: string;
	link?: boolean;
	updateMembershipData: () => Promise<void>;
};

const RenderContent = (props: RenderContentProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const { post, get } = useFetch('http://localhost:4000');
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	const [channel, setChannel] = useState<any>(null);
	const navigate = useNavigate();
	const globalActiveTab = useHookstate(activeTab);

	useEffect(() => {
		// even if global active tab is users, we want the channel data
		// because the user might be viewing a channel invite link
		get('/channels')
			.then((data: any) => {
				const tmp = data.find((item: any) => item.joinToken === props.value);
				console.log('tmp:', tmp);
				setChannel(tmp);
			})
			.catch((e) => console.error('No such chunnel', e));
	}, []);

	const handleInviteMember = async () => {
		try {
			const data: any = await get('/channels');
			const tmp = data.find((item: any) => item.joinToken === props.value);
			setChannel(tmp);
			if (tmp) {
				const res: any = await post(`/channels/${tmp.id}/join/${currentUserId}`, {
					token: props.value,
				});
				await props.updateMembershipData();
				// navigate(`/chat/channels/${tmp.id}`);
				navigate(`/chat/channels/`);
			} else {
				console.error('Channel not found for joinToken:', props.value);
			}
		} catch (error) {
			console.error('Error:', error);
		}
	};
	const toggleReadMore = () => {
		setIsExpanded(!isExpanded);
	};
	if (props.value.length <= 300 || isExpanded) {
		// Display the full content if it's shorter than or equal to 300 characters or if it's expanded
		return (
			<div className="msg-content-parag">
				{props.link ? (
					<div className="invitation-link" onClick={handleInviteMember}>
						<div className="invitation-title">Invitation Link</div>
						<div className="channel-name">
							Channel Name: {channel && <span>{channel.name}</span>}
						</div>
						<div className="join-token">{props.value}</div>
					</div>
				) : (
					<p>{props.value}</p>
				)}
				{props.value.length > 300 && (
					<button onClick={toggleReadMore}>{isExpanded ? 'Read Less' : 'Read More'}</button>
				)}
			</div>
		);
	} else {
		// Display a truncated version with a "Read More" link
		const truncatedContent = props.value.slice(0, 300) + '...';
		return (
			<div className="msg-content-parag">
				<p>{truncatedContent}</p>
				<button onClick={toggleReadMore}>{isExpanded ? 'Read Less' : 'Read More'}</button>
			</div>
		);
	}
};

const ContentHeaderUser = (props: any) => {
	const { headerData } = props;
	const globalUserInfo = useHookstate(userInfo);
	const glbMsgNotifSocket = useHookstate(message_socket);
	const globalIsInviting = useHookstate(glbIsInviting);
	const socket = useGameSocket();
	const globalGameState = useHookstate(gameState);

	const navigate = useNavigate();
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const handleRemoveId = (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Clicked on removeId');
		globalUserInfo.set(false);
		navigate('/chat/users');
	};

	const handleInviteGame = (e: React.MouseEvent, inviteeId: number) => {
		e.stopPropagation();
		globalIsInviting.set({
			isInviting: true,
			inviteeId: props.id,
		});
		navigate('/game/settings');
	};

	return (
		<div className="content-header">
			<div className="removeId" onClick={handleRemoveId}>
				<FontAwesomeIcon icon={faArrowLeft} />
			</div>
			<div className="image">
				<img src={headerData.avatar} alt="" />
			</div>
			<div className="details">
				<h3>
					{headerData.nickname}
					{headerData.id === currentUserId ? ' (You)' : ''}
				</h3>
			</div>
			{currentUserId !== props.id && (
				<div
					className="invite-game"
					style={{ marginLeft: 'auto' }}
					onClick={(e) => handleInviteGame(e, props.id)}
				>
					<FontAwesomeIcon icon={faGamepad} />
					<span className="game-icon-tooltip">Game Invitation</span>
				</div>
			)}
		</div>
	);
};

const ContentHeaderChannel = (props: any) => {
	const { headerData } = props;
	// console.log('headerData', headerData);
	const globalUserInfo = useHookstate(userInfo);
	const navigate = useNavigate();
	const toggleUserInfo = () => {
		globalUserInfo.set(true);
	};

	const handleRemoveId = (e: React.MouseEvent) => {
		e.stopPropagation();
		console.log('Clicked on removeId');
		globalUserInfo.set(false);
		navigate('/chat/channels');
	};

	return (
		<div className="content-header" onClick={toggleUserInfo}>
			<div className="removeId" onClick={handleRemoveId}>
				<FontAwesomeIcon icon={faArrowLeft} />
			</div>
			<div className="image">
				<img src={headerData.channel?.avatar} alt="" />
			</div>
			<div className="details">
				<h3>{headerData.channel?.name}</h3>
			</div>
		</div>
	);
};

type MessageBoxProps = {
	inputValue: string;
	setInputValue: (str: string) => void;
	handleSendMessage: () => void;
};
const MessageBox = ({ inputValue, setInputValue, handleSendMessage }: MessageBoxProps) => {
	const [isEmoji, setIsEmoji] = useState(false);
	const inputRef = useRef<any>(null);

	function onClick(emojiData: EmojiClickData, event: MouseEvent) {
		setInputValue(inputValue + emojiData.emoji);
		resetInputHeight();
	}

	const resetInputHeight = () => {
		// Reset the input field's height to its default
		if (inputRef.current) {
			inputRef.current.style.height = 'auto';
			inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 50)}px`;
			inputRef.current.style.overflowY = inputRef.current.scrollHeight > 100 ? 'auto' : 'hidden';
		}
	};

	const handleEnterKeyDown = (event: any) => {
		if (event.key === 'Enter') {
			event.preventDefault(); // Prevents the default behavior of Enter (e.g., submitting a form)
			handleSendMessage();
		}
	};

	return (
		<div className="message-box">
			{isEmoji && (
				<EmojiPicker
					onEmojiClick={onClick}
					autoFocusSearch={false}
					emojiStyle={EmojiStyle.NATIVE}
				/>
			)}
			<div className="message-content-box">
				<div className="message-content">
					<i onClick={() => setIsEmoji((prev) => !prev)}>
						<FontAwesomeIcon icon={faSmile} />
					</i>
					<textarea
						ref={inputRef}
						placeholder="Message"
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							resetInputHeight();
						}}
						onKeyDown={handleEnterKeyDown}
					/>
				</div>
				{inputValue && (
					<FontAwesomeIcon
						onClick={() => {
							handleSendMessage();
							resetInputHeight();
						}}
						icon={faPaperPlane}
						className="rotate-icon"
					/>
				)}
			</div>
		</div>
	);
};

type ChannelMessagesProps = {
	messages: any[];
	updateMembershipData: () => Promise<void>;
};

const ContentChannelMessages = ({ messages, updateMembershipData }: ChannelMessagesProps) => {
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	return (
		<div className="chat-container">
			{messages &&
				messages.map((item: any) => {
					return (
						<div
							className={`chat-msg`}
							style={
								item.user.id === currentUserId
									? { backgroundColor: 'rgb(220, 248, 197)', alignSelf: 'flex-end' }
									: { backgroundColor: 'white' }
							}
							key={item.id}
						>
							<div className="chat-msg-info">
								<img src={item.user.avatar} alt="salom" className="chat-msg-img" />
								<div className="chat-msg-title">
									<h5>{item.user.nickname}</h5>
									<div>
										<RenderContent
											updateMembershipData={updateMembershipData}
											value={item.content as string}
											link={item.link}
										/>
										<span className="time">{moment(item.created_at).format('L, h:mm:ss a')}</span>
									</div>
								</div>
							</div>
						</div>
					);
				})}
		</div>
	);
};

type UserMessagesProps = {
	messages: any[];
	updateMembershipData: () => Promise<void>;
};
const ContentUserMessages = ({ messages, updateMembershipData }: UserMessagesProps) => {
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	return (
		<div className="chat-container">
			{messages &&
				messages.map((item: any) => {
					return (
						<div
							className={`chat-msg`}
							style={
								item.sender.id === currentUserId
									? { backgroundColor: 'rgb(220, 248, 197)', alignSelf: 'flex-end' }
									: { backgroundColor: 'white' }
							}
							key={item.id}
						>
							<div className="chat-msg-info">
								<img src={item.sender.avatar} alt="salom" className="chat-msg-img" />
								<div className="chat-msg-title">
									<h5>{item.sender.nickname}</h5>
									<div>
										<RenderContent
											updateMembershipData={updateMembershipData}
											value={item.content as string}
											link={item.link}
										/>
										<span className="time">{moment(item.created_at).format('L, h:mm:ss a')}</span>
									</div>
								</div>
							</div>
						</div>
					);
				})}
		</div>
	);
};

type Props = {
	id: number;
	updateMembershipData: () => Promise<void>;
};

const ChatContent: React.FC<Props> = ({ id, updateMembershipData }: Props) => {
	const [inputValue, setInputValue] = useState('');

	const globalActiveTab = useHookstate(activeTab);
	const globalDirectMsgSocket = useHookstate(direct_msg_socket);
	const globalDirectMsgData = useHookstate(direct_msg_data);
	const globalChanMembershipData = useHookstate(channel_membership_data);
	const [headerData, setHeaderData] = useState<any>(null);
	const [chanHeaderData, setChanHeaderData] = useState<any>(null);
	const [chan_messages, setChanMessages] = useState<any>([]);
	const [user_messages, setUserMessages] = useState<any>([]);
	const { get } = useFetch('http://localhost:4000');
	const glbMsgNotifSocket = useHookstate(message_socket);
	const globalGroupMsgSocket = useHookstate(group_msg_socket);

	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	// const updateMembershipData = async (userId: any) => {
	// 	try {
	// 		const memberships = await get(`/channel-memberships/${userId}`);
	// 		if (memberships) {
	// 			// Update your hookstate store with the new memberships data
	// 			globalChanMembershipData.set(memberships);
	// 		}
	// 	} catch (error) {
	// 		console.error('Error fetching updated membership data:', error);
	// 	}
	// };

	useEffect(() => {
		if (globalActiveTab.get() === 'channels') {
			glbMsgNotifSocket.get().emit('markGroupNotificationAsRead', {
				channelId: id,
				userId: currentUserId,
				type: 'group-message',
			});
		} else {
			glbMsgNotifSocket.get()?.emit('markNotificationAsRead', {
				senderId: id,
				receiverId: currentUserId,
				type: 'direct-message',
			});
		}
	}, [globalDirectMsgSocket, globalGroupMsgSocket, user_messages]);

	useEffect(() => {
		if (globalActiveTab.get() === 'channels') {
			globalGroupMsgSocket
				.get()
				?.emit('getAllGroupMessages', { channelId: id, userId: currentUserId });
			globalGroupMsgSocket.get()?.on('allGroupMessages', (messages: any) => {
				console.log('messages', messages);
				const reversed = [...messages].sort((a, b) => b.id - a.id);
				setChanMessages(reversed);
			});

			if (globalChanMembershipData.get()) {
				updateMembershipData();
				const currentChan =
					globalChanMembershipData.get() &&
					globalChanMembershipData.get().find((item: any) => item?.membership?.channel?.id === id);
				if (currentChan) setChanHeaderData(currentChan.membership);
			}
		} else {
			globalDirectMsgSocket
				.get()
				.emit('getUserMessages', { senderId: currentUserId, receiverId: id });
			globalDirectMsgSocket.get().on('userMessages', (messages: any) => {
				console.log('userMessages:', messages);
				const reversed = [...messages].sort((a, b) => b.id - a.id);
				setUserMessages(reversed);
			});
			globalDirectMsgSocket.get().on('directMessageReceived', (data: any) => {
				console.log('directMessageReceived!!');
				setUserMessages((prev: any) => {
					if (!prev.some((item: any) => item.id === data.id)) {
						const reversed = [...prev, data].sort((a, b) => b.id - a.id);
						return reversed;
					}
					return prev;
				});
			});
			globalDirectMsgSocket.get()?.on('error', (data: any) => {
				console.log('eer:', data);
			});
		}
	}, [globalDirectMsgSocket, globalGroupMsgSocket]);

	useEffect(() => {
		if (globalActiveTab.get() === 'users') {
			get(`/user/${id}`).then((data) => {
				setHeaderData(data);
			});
			setUserMessages([]);
			globalDirectMsgSocket
				.get()
				.emit('getUserMessages', { senderId: currentUserId, receiverId: id });
			globalDirectMsgSocket.get().on('userMessages', (messages: any) => {
				const reversed = [...messages].sort((a, b) => b.id - a.id);
				setUserMessages(reversed);
			});
			globalDirectMsgSocket.get()?.on('error', (data: any) => {
				console.log('eer:', data);
			});
		} else {
			if (globalChanMembershipData.get()) {
				updateMembershipData();
				const currentChan =
					globalChanMembershipData.get() &&
					globalChanMembershipData.get().find((item: any) => item?.membership?.channel?.id === id);
				if (currentChan) setChanHeaderData(currentChan.membership);
			}
			setChanMessages([]);
			globalGroupMsgSocket
				.get()
				?.emit('getAllGroupMessages', { channelId: id, userId: currentUserId });
			globalGroupMsgSocket.get()?.on('allGroupMessages', (messages: any) => {
				console.log('messages', messages);
				const reversed = [...messages].sort((a, b) => b.id - a.id);
				setChanMessages(reversed);
			});
		}
	}, [id]);

	useEffect(() => {
		globalGroupMsgSocket.get()?.on('groupMessage', (data: any) => {
			console.log('dat12:', data);

			setChanMessages((prev: any) => {
				if (!prev.some((item: any) => item.id === data.id)) {
					const reversed = [...prev, data].sort((a, b) => b.id - a.id);
					return reversed;
				}
				return prev;
			});
		});
	}, [globalGroupMsgSocket]);

	const handleSendMessage = async () => {
		if (inputValue.trim() === '' || !globalDirectMsgSocket.get()) return;
		const data: any = await get('/channels');
		const tmp = data.find((item: any) => item.joinToken === inputValue);
		let link = tmp ? true : false;
		if (globalActiveTab.get() === 'channels') {
			updateMembershipData();
			const text = {
				content: inputValue,
				userId: currentUserId,
				channelId: id,
				link,
			};
			globalGroupMsgSocket.get()?.emit('createGroupMessage', text);
		} else {
			const text = {
				content: inputValue,
				sender_id: currentUserId,
				receiver_id: id,
				link,
			};
			globalDirectMsgSocket.get().emit('sendDirectMessage', text);
			globalDirectMsgSocket.get().on('directMessageSent', (data: any) => {
				setUserMessages((prev: any) => {
					if (!prev.some((item: any) => item.id === data.id)) {
						const reversed = [...prev, data].sort((a, b) => b.id - a.id);
						return reversed;
					}
					return prev;
				});
			});
			globalDirectMsgSocket.get().on('directMessageError', (data: any) => {
				console.error('err:', data);
			});
		}
		setInputValue('');
	};

	return (
		<div className="container-content" id="chatBox">
			{chanHeaderData && globalActiveTab.get() === 'channels' && (
				<ContentHeaderChannel headerData={chanHeaderData} />
			)}
			{headerData && globalActiveTab.get() === 'users' && (
				<ContentHeaderUser headerData={headerData} id={id} />
			)}
			{globalActiveTab.get() === 'channels' &&
				(chan_messages ? (
					<ContentChannelMessages
						updateMembershipData={updateMembershipData}
						messages={chan_messages}
					/>
				) : (
					<MyLoader />
				))}
			{globalActiveTab.get() === 'users' && user_messages && (
				<ContentUserMessages updateMembershipData={updateMembershipData} messages={user_messages} />
			)}
			<MessageBox
				inputValue={inputValue}
				setInputValue={setInputValue}
				handleSendMessage={handleSendMessage}
			/>
		</div>
	);
};

export default ChatContent;
