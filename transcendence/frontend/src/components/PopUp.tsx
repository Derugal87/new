import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	faTimes,
	faUserCog,
	faBan,
	faSignOutAlt,
	faAdd,
	faTrash,
	faUnlock,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/PopUp.style.css';
import { useHookstate } from '@hookstate/core';
import activeTab from '../stores/chat/chatTabsStore';
import useFetch from '../customHooks/useFetch';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UpdateChannel } from './chat/UpdateChannel';
import userInfo from '../stores/chat/store';
import { blocking_socket } from '../stores/chat/chatDirectMsgStore';
import { group_msg_socket } from '../stores/chat/chatGroupMsgStore';
import { friend_req_socket } from '../stores/notifications/FriendRequest.store';
interface PopupProps {
	x: number;
	y: number;
	onClose: () => void;
	rightClickedChatId: number | null;
	Channels: any;
	Users: any;
}

const PopUp: React.FC<PopupProps> = ({ x, y, onClose, rightClickedChatId, Channels, Users }) => {
	const globalActiveTab = useHookstate(activeTab);
	const globalUserInfo = useHookstate(userInfo);
	const [updateChannel, setUpdateChannel] = useState(false);
	const navigate = useNavigate();
	const { get } = useFetch('http://localhost:4000');
	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	const [currentChannel, setCurrentChannel] = useState<any>(null);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [block, setBlock] = useState(false);
	const globalGroupMsgSocket = useHookstate(group_msg_socket);
	const glbBlockingSocket = useHookstate(blocking_socket);
	const global_fr_req_socket = useHookstate(friend_req_socket);
	const [isMyFriend, setIsMyFriend] = useState(false);

	useEffect(() => {
		if (globalActiveTab.get() === 'channels') {
			const tmpChannel = Channels.find(
				(item: any) => item.membership.channel.id === rightClickedChatId,
			);
			setCurrentChannel(tmpChannel);
		} else {
			const tmpUser = Users.find((item: any) => item.user.id === rightClickedChatId);
			setCurrentUser(tmpUser);
		}
	}, []);

	const screenWidth = window.innerWidth;

	// Calculate the left position based on the screen width
	const leftPosition = screenWidth <= 700 ? '150px' : x;

	const handleFriendRequest = () => {
		// event.stopPropagation();
		console.log('aweosem', currentUser);
		const sending_data = {
			senderId: currentUserId,
			receiverId: rightClickedChatId,
		};
		console.log('sending_data', sending_data);
		global_fr_req_socket.get().emit('sendFriendRequest', sending_data);
	};

	// function FindMyFriend(): boolean {
	// 	console.log('werereere:', currentUser);
	// 	get(`/friendships/are-friends/${currentUserId}/${currentUser?.user.id}`).then((data) =>
	// 		console.log('we are', data),
	// 	);
	// 	return true;
	// }

	useEffect(() => {
		get(`/friendships/are-friends/${currentUserId}/${rightClickedChatId}`).then((data: any) => {
			console.log('we are', data);
			setIsMyFriend(data?.areFriends);
		});
	}, []);

	const handleBlockUser = () => {
		glbBlockingSocket
			.get()
			?.emit('blockUser', { userId: currentUserId, blockedUserId: rightClickedChatId });
		onClose();
		setBlock(true);
	};

	const handleUnBlockUser = () => {
		glbBlockingSocket
			.get()
			?.emit('unblockUser', { userId: currentUserId, unblockedUserId: rightClickedChatId });
		onClose();
		setBlock(false);
	};

	const handleLeaveChannel = () => {
		globalGroupMsgSocket.get()?.emit('leaveChannel', {
			channelId: rightClickedChatId,
			userId: currentUserId,
		});
		onClose();
		globalUserInfo.set(false);
		navigate('/chat/channels');
	};

	const handleDeleteChannel = () => {
		globalGroupMsgSocket.get()?.emit('deleteChannel', {
			channelId: rightClickedChatId,
			userId: currentUserId,
		});
		onClose();
		globalUserInfo.set(false);
		navigate('/chat/channels');
	};

	return (
		<div
			style={{
				position: 'absolute',
				width: '150px',
				top: y,
				left: leftPosition,
				background: 'rgb(229 247 255)',
				padding: '10px',
				borderRadius: '4px',
				zIndex: 1,
				boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
				margin: '10px',
			}}
		>
			<div className="main-permission">
				{globalActiveTab.get() === 'users' && (
					<>
						{!isMyFriend && (
							<button onClick={handleFriendRequest}>
								<FontAwesomeIcon icon={faAdd} />
								{` `} Add Friend
							</button>
						)}
						{currentUser && !currentUser.blocked && (
							<button onClick={handleBlockUser}>
								<FontAwesomeIcon icon={faBan} />
								{` `} Block User
							</button>
						)}
						{currentUser && currentUser.blocked && (
							<button onClick={handleUnBlockUser}>
								<FontAwesomeIcon icon={faUnlock} />
								{` `} Unlock User
							</button>
						)}
					</>
				)}
				{globalActiveTab.get() === 'channels' && (
					<>
						{currentChannel && currentChannel?.membership?.role === 'channel_owner' && (
							<button onClick={() => setUpdateChannel(!updateChannel)}>
								<FontAwesomeIcon icon={faUserCog} />
								{` `}Change Privacy
							</button>
						)}
						{currentChannel && currentChannel?.membership?.role === 'channel_owner' && (
							<button style={{ color: '#c10606' }} onClick={handleDeleteChannel}>
								<FontAwesomeIcon icon={faTrash} />
								{` `} Delete Channel
							</button>
						)}
						<button style={{ color: '#c10606' }} onClick={handleLeaveChannel}>
							<FontAwesomeIcon icon={faSignOutAlt} />
							{` `} Leave Channel
						</button>
					</>
				)}
			</div>
			<div className="close-btn" onClick={onClose}>
				<FontAwesomeIcon icon={faTimes} />
			</div>
			{updateChannel && (
				<UpdateChannel
					onClose={onClose}
					rightClickedChatId={rightClickedChatId}
					setUpdateChannel={setUpdateChannel}
				/>
			)}
		</div>
	);
};

export default PopUp;
