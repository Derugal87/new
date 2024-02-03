import callMade from '../../images/callMade.png';
import callRecieved from '../../images/callReceived.png';
import '../../styles/PersonalInfo.style.css';
import { useState, useEffect } from 'react';
import useFetch from '../../customHooks/useFetch';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../utils/NotFound';
import { io } from 'socket.io-client';
import chatIcon from '../../images/chatIcon.png';
import gameIcon from '../../images/gameIcon.png';
import { useHookstate } from '@hookstate/core';
import { friend_req_data, friend_req_socket } from '../../stores/notifications/FriendRequest.store';
import { glbIsInviting } from '../../stores/game/isInvitingStore';

export default function FriendInfo() {
	const [userInfo, setUserInfo] = useState<any>(null);
	const { get, post } = useFetch('http://localhost:4000');
	const param = useParams();
	const id = param.id ? Number.parseInt(param.id, 10) : null;
	const navigate = useNavigate();
	let currentUserId: any = localStorage.getItem('user_id');
	const [isFriend, setIsFriend] = useState(false);
	const [isBlocked, setIsBlocked] = useState(false);

	const global_fr_req_socket = useHookstate(friend_req_socket);
	const global_fr_req_data = useHookstate(friend_req_data);
	const globalIsInviting = useHookstate(glbIsInviting);

	const [error, setError] = useState(null);

	useEffect(() => {
		get(`/user/${id}`)
			.then((data) => {
				setUserInfo(data);
				console.log('user info', data);
			})
			.catch((e) => {
				console.error(e);
				setError(e);
			});
		get(`/user/${id}/wins-losses`)
			.then((data: any) => {
				setUserInfo((prev: any) => {
					return { ...prev, ...data };
				});
			})
			.catch((e) => {
				console.error(e);
				setError(e);
			});
	}, []);

	useEffect(() => {
		// Fetch friendship data for compare to show or hide friendRequest icon
		get(`/friendships/friends/${currentUserId}`)
			.then((data: any) => {
				const tmp = data.some((item: any) => item.id === id);
				console.log(':::', data, tmp, id);
				setIsFriend(tmp);
			})
			.catch((e) => console.error('fetching my friends error', e));

		// Fetch Blocked data for compare to show or hide Block icon
		get(`/user/${currentUserId}/blocked-friends`)
			.then((data: any) => {
				const tmp = data.some((item: any) => item.id === id);
				setIsBlocked(tmp);
			})
			.catch((e) => console.error('fetching my friends error', e));
	}, []);

	const handleFriendRequest = async (newFriendId: number | null) => {
		const sending_data = {
			senderId: currentUserId,
			receiverId: newFriendId,
		};
		console.log('sending_data', sending_data);
		global_fr_req_socket.get().emit('sendFriendRequest', sending_data);
	};

	const handleBlockUser = (userId: number | null) => {
		post(`/blocking/block/${currentUserId}`, { blockedUserId: userId })
			.then((data) => console.log('blocked user', data))
			.catch((e) => console.error('blocked user error', e));
		alert('You block this user');
	};

	const handleUnlockUser = (userId: number | null) => {
		post(`/blocking/unblock/${currentUserId}`, { unblockedUserId: userId })
			.then((data) => console.log('unblockedUserId user', data))
			.catch((e) => console.error('unblockedUserId user error', e));
		alert('You unlock this user');
	};

	const handleRedirectChat = () => {
		navigate(`/chat/users/${id}`);
	};

	const handleInviteGame = () => {
		globalIsInviting.set({
			isInviting: true,
			inviteeId: id,
		});
		navigate('/game/settings');
	};

	if (userInfo) {
		console.log('userInfo:', userInfo);
	}

	if (error) {
		return <NotFound />;
	}

	if (userInfo?.error) {
		return <NotFound />;
	} else {
		return (
			<div className="personal-info">
				{userInfo && (
					<div className="personal-info-box">
						<img src={userInfo.avatar} alt="Profile" className="personal-img" />
						<div className="personal-msg">
							<h2>{userInfo.nickname}</h2>
							<img
								src={chatIcon}
								alt="msg-icon"
								className={`icon personal-msg-icon`}
								onClick={handleRedirectChat}
							/>
							<img
								src={gameIcon}
								alt="game-icon"
								className={`icon personal-msg-icon`}
								onClick={handleInviteGame}
							/>
						</div>
						<h3>Status: {userInfo.isInGame ? 'In a game' : userInfo.status}</h3>
						<h3>Points: {userInfo.points}</h3>
						<h3>
							Win: {userInfo.wins}{' '}
							<span>
								<img src={callMade} alt="callMade" className="callMade" />
							</span>
						</h3>
						<h3>
							Defeat: {userInfo.losses}{' '}
							<span>
								<img src={callRecieved} alt="callRecieved" className="callRecieved" />
							</span>
						</h3>
						{currentUserId !== param.id && (
							<div className="action-buttons">
								{!isFriend && (
									<button type="submit" className={`save`} onClick={() => handleFriendRequest(id)}>
										Add Friend
									</button>
								)}
								{!isBlocked && (
									<button type="button" className="cancel" onClick={() => handleBlockUser(id)}>
										Block
									</button>
								)}
								{isBlocked && (
									<button type="button" className="cancel" onClick={() => handleUnlockUser(id)}>
										Unlock User
									</button>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		);
	}
}
