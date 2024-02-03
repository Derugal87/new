import './App.css';

import { BrowserRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import GamePage from './pages/GamePage';
import GamePageStart from './components/game/GamePageStart';
import ProfilePage from './pages/ProfilePage';
import NotFound from './components/utils/NotFound';
import '@fortawesome/fontawesome-free/css/all.min.css'; //for homepage
import FrinedProfilePage from './pages/FriendProfilePage';
import MainGame from './components/game/MainGame';
import TwoFactorAuthPage from './pages/TwoFactorAuthPage';
import { useHookstate } from '@hookstate/core';
import { friend_req_data, friend_req_socket } from './stores/notifications/FriendRequest.store';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { direct_msg_data, direct_msg_socket } from './stores/chat/chatDirectMsgStore';
import { glbNotifcationCount } from './stores/chat/notificationCountStore';
import { glbUserStore } from './stores/user/userStore';
import { glbGameSocket } from './stores/game/glbGameSocketStore';
import { glbLoginStore } from './stores/loginAuth/loginStore';
import { GameSocketProvider, useGameSocket } from './customContexts/gameSocketContext';

function App() {
	const global_fr_req_socket = useHookstate(friend_req_socket);
	const global_fr_req_data = useHookstate(friend_req_data);
	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const globalDirectMsgSocket = useHookstate(direct_msg_socket);
	const globalDirectMsgData = useHookstate(direct_msg_data);
	const globalNotifcationCount = useHookstate(glbNotifcationCount);
	const globalUserStore = useHookstate(glbUserStore);
	const globalLoginStore = useHookstate(glbLoginStore);

	//friend request socket
	useEffect(() => {
		if (globalUserStore.get() === '' && !globalLoginStore.get()) return;
		let newSocket = io('http://localhost:4000/friend-request', {
			withCredentials: true,
			query: { userId: currentUserId },
		});
		newSocket.on('connect', () => {
			console.log('Connected to newSocket friend request');
			newSocket.emit('setUserId', { userId: currentUserId });
		});
		global_fr_req_socket.set(newSocket);

		return () => {
			if (newSocket) {
				newSocket.disconnect();
			}
		};
	}, [globalUserStore, globalLoginStore]);

	useEffect(() => {
		const socket = global_fr_req_socket.get();
		console.log('socket:::', socket);
		if (socket) {
			socket.on('new-friend-request', (data: any) => {
				console.log('Received new-friend-request event:', data);
				if (data) {
					global_fr_req_data.set((prev: any) => {
						if (!prev.some((item: any) => item?.id === data?.id)) {
							const newData = [...prev, data];
							return newData;
						}
						return prev;
					});
				}
			});

			socket.on('error', (error: any) => {
				console.error('WebSocket Error:', error);
			});
		}
	}, [global_fr_req_socket]);
	//end friend request socket

	//direct message socket
	// direct message socket
	useEffect(() => {
		if (globalUserStore.get() === '' && !globalLoginStore.get()) return;
		globalDirectMsgSocket.set(
			io('http://localhost:4000/direct-messages', {
				withCredentials: true,
				query: { userId: currentUserId },
			}),
		);

		globalDirectMsgSocket.get().on('connect', () => {
			console.log('Connected to newSocket direct msg');
			globalDirectMsgSocket.get().emit('setUserId', { userId: currentUserId });
			globalDirectMsgSocket.get().emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
		});

		return () => {
			if (globalDirectMsgSocket.get()) {
				globalDirectMsgSocket.get().disconnect();
			}
		};
	}, [globalUserStore, globalLoginStore]);

	useEffect(() => {
		const socket = globalDirectMsgSocket.get();
		if (!socket) return;

		socket.on('friendsAndRecipients', (memberships: any) => {
			console.log('wes', memberships, currentUserId);
			globalDirectMsgData.set(memberships);
		});

		socket.on('error', (error: any) => {
			console.error('direct msg Error:', error);
		});
	}, [globalDirectMsgSocket]);

	useEffect(() => {
		const socket = globalDirectMsgSocket.get();
		if (!socket) return;

		globalDirectMsgSocket.get()?.on('directMessageSent', (data: any) => {
			globalDirectMsgSocket.get().emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
			socket.on('friendsAndRecipients', (memberships: any) => {
				globalDirectMsgData.set(memberships);
			});
		});
		globalDirectMsgSocket.get()?.on('directMessageReceived', (data: any) => {
			globalDirectMsgSocket.get().emit('getAllFriendsAndDirectMessageRecipients', currentUserId);
			socket.on('friendsAndRecipients', (memberships: any) => {
				globalDirectMsgData.set(memberships);
			});
		});
		socket.on('error', (error: any) => {
			console.error('direct msg Error:', error);
		});
	}, [globalDirectMsgSocket]);

	// notification count
	useEffect(() => {
		if (!globalDirectMsgData.get()) return;
		const { directMessageRecipients, friends } = globalDirectMsgData.get();
		console.log('globalDirectMsgData:', globalDirectMsgData.get());
		const data = [...directMessageRecipients, ...friends];
		let count = 0;
		data.forEach((item: any) => {
			count += item.unreadMessagesCount;
		});
		globalNotifcationCount.set(count);
	}, [globalDirectMsgData.get()]);
	// end notification count
	return (
		<GameSocketProvider>
			<BrowserRouter>
				<main>
					<Routes>
						<Route path="/" element={<LoginPage />} />
						<Route path="/home" element={<HomePage />} />
						<Route path="/chat" element={<ChatPage />}>
							<Route path="/chat/users" element={<ChatPage />} />
							<Route path="/chat/channels" element={<ChatPage />} />
							<Route path="/chat/users/:id" element={<ChatPage />} />
							<Route path="/chat/channels/:id" element={<ChatPage />} />
						</Route>
						<Route path="/game" element={<GamePage />} />
						<Route path="/game/settings" element={<GamePageStart />} />
						<Route path="/game/start" element={<MainGame />} />
						<Route path="/validate-2fa" element={<TwoFactorAuthPage />} />
						{/* <Route
						path="/TwoFactorAuth"
						element={
							<TwoFactorAuth
								otpauth_url="YOUR_OTPAUTH_URL"
								base32="YOUR_BASE32_STRING"
								closeModal={() => {
									// Define a function to close the modal
									// You can implement this as needed
								}}
							/>
						}
					/> */}
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/friend/:id" element={<FrinedProfilePage />} />
						<Route path="*" element={<NotFound />} />
					</Routes>
				</main>
			</BrowserRouter>
		</GameSocketProvider>
	);
}

export default App;
