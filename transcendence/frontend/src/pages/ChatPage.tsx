import React, { useEffect, useState } from 'react';
import Container from '../components/Container';
import Header from '../components/Header';
import '../styles/ChatPage.style.css';
import '../styles/CreateChannel.style.css';
import ChatLeftSide from '../components/chat/ChatLeftSide';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ChatContent from '../components/chat/ChatContent';
import ChatRightSide from '../components/chat/ChatRightSide';
import { useHookstate } from '@hookstate/core';
import userInfo from '../stores/chat/store';
import activeTab, { channelUserId } from '../stores/chat/chatTabsStore';
import useFetch from '../customHooks/useFetch';
import { glbLoginStore } from '../stores/loginAuth/loginStore';
import { io } from 'socket.io-client';
import {
	blocking_socket,
	direct_msg_data,
	direct_msg_socket,
} from '../stores/chat/chatDirectMsgStore';
import { message_socket } from '../stores/notifications/Message.store';
import {
	channel_membership_data,
	channel_membership_socket,
} from '../stores/chat/channelMembershipStore';
import { group_msg_data, group_msg_socket } from '../stores/chat/chatGroupMsgStore';
import { glbNotifcationCount } from '../stores/chat/notificationCountStore';

const ChatPage: React.FC = () => {
	const globalUserInfo = useHookstate(userInfo);
	const globalActiveTab = useHookstate(activeTab);
	const globalDirectMsgSocket = useHookstate(direct_msg_socket);
	const globalDirectMsgData = useHookstate(direct_msg_data);
	const globalChanMembershipSocket = useHookstate(channel_membership_socket);
	const globalChanMembershipData = useHookstate(channel_membership_data);
	const globalLoginStore = useHookstate(glbLoginStore);
	const { get } = useFetch('http://localhost:4000');

	const location = useLocation();
	const tmp = location.pathname.includes('channels') ? 'channels' : 'users';
	const param = useParams();
	const globalChannelUserId = useHookstate(channelUserId);
	const [id, setId] = useState<any>(null);

	const navigate = useNavigate();

	const updateMembershipData = async () => {
		try {
			const userId = localStorage.getItem('user_id');
			if (userId) {
				const updatedData = await get(`/channel-memberships/${userId}`);
				globalChanMembershipData.set(updatedData);
			}
		} catch (error) {
			console.error('Error updating channel membership data:', error);
		}
	};

	useEffect(() => {
		setId(param.id ? Number.parseInt(param.id, 10) : null);
		globalChannelUserId.set(param.id ? Number.parseInt(param.id, 10) : null);
	}, [param]);

	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const globalGroupMsgSocket = useHookstate(group_msg_socket);
	const glbMsgNotifSocket = useHookstate(message_socket);
	const glbBlockingSocket = useHookstate(blocking_socket);

	// blocking socket
	useEffect(() => {
		glbBlockingSocket.set(
			io('http://localhost:4000/blocking', {
				query: { userId: currentUserId },
				withCredentials: true,
			}),
		);

		glbBlockingSocket.get().on('connect', () => {
			console.log('Connected to newSocket block user');
			glbBlockingSocket.get().emit('setUserId', { userId: currentUserId });
		});
		return () => {
			if (glbBlockingSocket.get()) {
				glbBlockingSocket.get().disconnect();
			}
		};
	}, []);

	useEffect(() => {
		glbBlockingSocket.get()?.on('blockUserSuccess', (data: any) => {
			console.log('blocked data:', data);
			globalDirectMsgSocket.get()?.emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
		});
		glbBlockingSocket.get()?.on('unblockUserSuccess', (data: any) => {
			console.log('unblockUserSuccess data:', data);
			globalDirectMsgSocket.get()?.emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
		});
	}, [glbBlockingSocket.get()]);
	// end blocking socket

	// notification socket
	useEffect(() => {
		glbMsgNotifSocket.set(
			io('http://localhost:4000/notifications', {
				query: { userId: currentUserId },
				withCredentials: true,
			}),
		);

		glbMsgNotifSocket.get().on('connect', () => {
			console.log('Connected to newSocket notifications');
			glbMsgNotifSocket.get().emit('setUserId', { userId: currentUserId });
		});
		return () => {
			if (glbMsgNotifSocket.get()) {
				glbMsgNotifSocket.get().disconnect();
			}
		};
	}, []);

	useEffect(() => {
		glbMsgNotifSocket.get()?.on('notificationMarkedAsRead', (data: any) => {
			globalDirectMsgSocket.get()?.emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
		});
	}, [glbMsgNotifSocket.get()]);
	// end notification socket

	// group message socket
	useEffect(() => {
		globalGroupMsgSocket.set(
			io('http://localhost:4000/group-messages', {
				query: { userId: currentUserId },
				withCredentials: true,
			}),
		);

		globalGroupMsgSocket.get().on('connect', () => {
			console.log('Connected to newSocket group-messages');
			globalGroupMsgSocket.get().emit('setUserId', { userId: currentUserId });
		});
		return () => {
			if (globalGroupMsgSocket.get()) {
				globalGroupMsgSocket.get().disconnect();
			}
		};
	}, []);

	useEffect(() => {
		globalGroupMsgSocket.get()?.on('channelCreated', (data: any) => {
			console.log('channelCreated', data);
			globalChanMembershipSocket.get()?.emit('getUserChannelMemberships', currentUserId);
		});
		globalGroupMsgSocket.get()?.on('leaveChannelSuccess', (data: any) => {
			console.log('leave chanel data:', data);
			globalChanMembershipSocket.get()?.emit('getUserChannelMemberships', currentUserId);
		});
		globalGroupMsgSocket.get()?.on('deleteChannelSuccess', (data: any) => {
			console.log('leave chanel data:', data);
			globalChanMembershipSocket.get()?.emit('getUserChannelMemberships', currentUserId);
		});
		globalGroupMsgSocket.get()?.on('updateChannelSuccess', (data: any) => {
			console.log('updateChannelSuccess chanel data:', data);
			globalChanMembershipSocket.get()?.emit('getUserChannelMemberships', currentUserId);
		});
		globalGroupMsgSocket.get()?.on('JoinChannelSuccess', (data: any) => {
			console.log('JoinChannelSuccess chanel data:', data);
			globalChanMembershipSocket.get()?.emit('getUserChannelMemberships', currentUserId);
		});
		globalGroupMsgSocket.get()?.on('createChannelError', (data: any) => {
			console.error('error happen:', data);
		});
	}, [globalGroupMsgSocket.get()]);
	// end group messages

	// direct message socket
	// useEffect(() => {
	// 	globalDirectMsgSocket.set(
	// 		io('http://localhost:4000/direct-messages', {
	// 			withCredentials: true,
	// 			query: { userId: currentUserId },
	// 		}),
	// 	);

	// 	globalDirectMsgSocket.get().on('connect', () => {
	// 		console.log('Connected to newSocket direct msg');
	// 		globalDirectMsgSocket.get().emit('setUserId', { userId: currentUserId });
	// 		globalDirectMsgSocket.get().emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
	// 	});

	// 	return () => {
	// 		if (globalDirectMsgSocket.get()) {
	// 			globalDirectMsgSocket.get().disconnect();
	// 		}
	// 	};
	// }, []);

	// useEffect(() => {
	// 	const socket = globalDirectMsgSocket.get();
	// 	if (!socket) return;

	// 	// socket.on('friendsAndRecipients', (memberships: any) => {
	// 	// 	console.log('wes', memberships, currentUserId);
	// 	// 	globalDirectMsgData.set(memberships);
	// 	// });
	// 	globalDirectMsgSocket.get()?.on('directMessageSent', (data: any) => {
	// 		console.log('idddddddd1:', currentUserId);
	// 		globalDirectMsgSocket.get().emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
	// 		socket.on('friendsAndRecipients', (memberships: any) => {
	// 			globalDirectMsgData.set(memberships);
	// 		});
	// 	});
	// 	globalDirectMsgSocket.get()?.on('directMessageReceived', (data: any) => {
	// 		console.log('idddddddd2:', currentUserId);
	// 		globalDirectMsgSocket.get().emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
	// 		socket.on('friendsAndRecipients', (memberships: any) => {
	// 			globalDirectMsgData.set(memberships);
	// 		});
	// 	});
	// 	socket.on('error', (error: any) => {
	// 		console.error('direct msg Error:', error);
	// 	});
	// }, [globalDirectMsgSocket]);
	//end direct message socket

	// chan membership socket
	useEffect(() => {
		globalChanMembershipSocket.set(
			io('http://localhost:4000/channel-memberships', {
				withCredentials: true,
				query: { userId: currentUserId },
			}),
		);

		globalChanMembershipSocket.get().on('connect', () => {
			console.log('Connected to newSocket globalChanMembershipSocket');
			globalChanMembershipSocket.get().emit('setUserId', { userId: currentUserId });
			globalChanMembershipSocket.get().emit('getUserChannelMemberships', currentUserId);
		});
		globalChanMembershipSocket.get().on('userChannelMembershipsError', (data: any) => {
			console.log('errrorr1', data);
		});

		return () => {
			if (globalChanMembershipSocket.get()) {
				globalChanMembershipSocket.get().disconnect();
			}
		};
	}, []);

	useEffect(() => {
		const socket = globalChanMembershipSocket.get();
		if (!socket) return;

		socket.on('userChannelMemberships', (memberships: any) => {
			console.log('memeser1', memberships, currentUserId);
			globalChanMembershipData.set(memberships);
		});

		socket.on('error', (error: any) => {
			console.error('direct msg Error:', error);
		});
	}, [globalChanMembershipSocket]);

	//end chan membership socket

	useEffect(() => {
		if (!globalLoginStore.get()) {
			navigate('/');
		}
		if (id) {
			if (globalActiveTab.get() === 'channels') {
				get(`/channel-memberships/${id}/members/count`).then((data: any) => {
					console.log('channel', data);
					const tmp = data?.members?.find((item: any) => item.user.id === currentUserId);
					if (!tmp) {
						console.log('i am not in this channel');
						globalChannelUserId.set(null);
						navigate('/chat/channels');
					}
				});
			}
		}
	}, []);

	useEffect(() => {
		globalDirectMsgSocket.get()?.emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
		globalActiveTab.set(tmp);
	}, [tmp]);

	console.log('cool1', globalChanMembershipData.get());
	return (
		<Container>
			<>
				<Header />
				<div className="main-cont">
					<ChatLeftSide />
					<section
						className={`content ${globalUserInfo.get() ? 'new_content_width' : ''}`}
						data-globaluserinfo={globalUserInfo.get()}
						data-paramid={param.id !== undefined}
					>
						{globalActiveTab.get() === 'users' &&
							globalChannelUserId.get() !== null &&
							globalDirectMsgSocket.get()?.connected && (
								<ChatContent
									updateMembershipData={updateMembershipData}
									id={globalChannelUserId.get() as number}
								/>
							)}
						{globalActiveTab.get() === 'channels' &&
							globalChannelUserId.get() &&
							globalChanMembershipData.get() && (
								<ChatContent
									updateMembershipData={updateMembershipData}
									id={globalChannelUserId.get() as number}
								/>
							)}
					</section>
					{globalActiveTab.get() === 'channels' &&
						globalUserInfo.get() &&
						globalChannelUserId.get() &&
						globalChanMembershipData.get() && (
							<ChatRightSide id={globalChannelUserId.get() as number} />
						)}
				</div>
			</>
		</Container>
	);
};

export default ChatPage;
