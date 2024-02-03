import { useEffect, useRef, useState } from 'react';
import gameIcon from '../../images/gameIcon.png';
import { useHookstate } from '@hookstate/core';
import { friend_req_data, friend_req_socket } from '../../stores/notifications/FriendRequest.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useGameSocket } from '../../customContexts/gameSocketContext';
import { game_req_data } from '../../stores/notifications/GameRequest.store';
import useFetch from '../../customHooks/useFetch';
import { useNavigate } from 'react-router-dom';
import { glbIsInviting } from '../../stores/game/isInvitingStore';

type PopUpProps = {
	listUser: any;
	socket: any;
	setIsPopupOpen: (val: boolean) => void;
	setCount: (val: any) => void;
	handlePopupClose: (e: React.MouseEvent) => void;
	setGameRequests: (val: any) => void;
};

const PopUpFriendRequests = ({
	listUser,
	socket,
	setIsPopupOpen,
	setCount,
	handlePopupClose,
	setGameRequests,
}: PopUpProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const popupRef = useRef<HTMLDivElement>(null);
	const global_fr_req_data = useHookstate(friend_req_data);
	const global_game_req_data = useHookstate(game_req_data);

	const navigate = useNavigate();
	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const handleAccept = (e: React.MouseEvent, inviterId: number) => {
		e.stopPropagation();
		if (!socket) return;
		socket.emit('acceptGameInvitation', {
			inviterId: inviterId.toString(),
			inviteeId: currentUserId.toString(),
		});
		setCount((prev: number) => prev - 1);
		console.log('global_game_req_data111:', global_game_req_data.get(), inviterId);
		global_game_req_data.set((prevData: any) =>
			prevData.filter((user: any) => user.inviterId !== inviterId.toString()),
		);
		setIsPopupOpen(false);
		navigate('/game/start');
	};

	const handleDecline = (e: React.MouseEvent, inviterId: number) => {
		e.stopPropagation();
		if (!socket) return;
		console.log('inviterId:', inviterId);
		console.log('currentUserId:', currentUserId);
		socket.emit('rejectGameInvitation', {
			inviterId: inviterId.toString(),
			inviteeId: currentUserId.toString(),
		});
		setCount((prev: number) => prev - 1);
		// console.log('global_game_req_data222:', global_game_req_data.get());
		global_game_req_data.set((prevData: any) =>
			prevData.filter((user: any) => user.inviterId !== inviterId.toString()),
		);
		setIsPopupOpen(false);
	};

	return (
		<div
			className={`popup2 ${isHovered ? 'hovered' : ''}`}
			ref={popupRef}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="friend-req">
				<div className="bell-icon">
					<FontAwesomeIcon icon={faBell} />
				</div>
				<p>{`You have ${listUser.length} game request`}</p>
			</div>
			<ul className="list-friends">
				{listUser &&
					listUser.map(
						(item: any) => (
							console.log('item:::', item),
							(
								<li key={item.id} className="friend-request-style">
									<div className="user-container">
										<img src={item.avatar} alt="notification" />
										<div className="user-nickname">{item.nickname}</div>
									</div>
									<div className="button-container">
										<button className="accept-button" onClick={(e) => handleAccept(e, item.id)}>
											Accept
										</button>
										<button className="decline-button" onClick={(e) => handleDecline(e, item.id)}>
											Decline
										</button>
									</div>
								</li>
							)
						),
					)}
			</ul>

			<button className={`popup-close ${isHovered ? 'visible' : ''}`} onClick={handlePopupClose}>
				<FontAwesomeIcon icon={faTimes} />
			</button>
		</div>
	);
};

export const GameRequestIcon = () => {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const global_fr_req_socket = useHookstate(friend_req_socket);
	const global_game_req_data = useHookstate(game_req_data);
	const [count, setCount] = useState(0);
	const { get } = useFetch('http://localhost:4000');
	// const [friendRequests, setFriendRequests] = useState<any>([]);
	const [gameRequests, setGameRequests] = useState<any>([]);
	const socket = useGameSocket();

	useEffect(() => {
		socket?.on('invitationReceived', (data: any) => {
			console.log('Received invitationReceived event:', data);
			global_game_req_data.set((prev: any) => {
				if (!prev.some((item: any) => item.inviterId === data.inviterId)) {
					const newData = [...prev, data];
					return newData;
				}
				return prev;
			});
			console.log('global_game_req_data:', global_game_req_data.get());
		});
	}, [socket]);

	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	useEffect(() => {
		const fetchData = async () => {
			if (global_game_req_data.get() !== null) {
				try {
					const res = await Promise.all(
						global_game_req_data.get().map((item: any) => {
							return get(`/user/${item.inviterId}`).then((data: any) => {
								return data;
							});
						}),
					);
					console.log('res:', res);
					setCount(global_game_req_data.get()?.length);
					setGameRequests(res);
				} catch (error) {
					console.error('Error fetching data:', error);
				}
			}
		};

		fetchData();
	}, [global_game_req_data]);

	const handlePopUpOpen = () => {
		if (count > 0) setIsPopupOpen(true);
	};

	const handlePopupClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsPopupOpen(false);
	};

	return (
		<li className="header-nav-item" onClick={handlePopUpOpen}>
			<div className="notification-badge">
				<img src={gameIcon} alt="gameIcon" className={`icon`} />
				{count > 0 && <span className="badge">{count}</span>}
			</div>
			{isPopupOpen && (
				<PopUpFriendRequests
					listUser={gameRequests}
					socket={socket}
					setIsPopupOpen={setIsPopupOpen}
					setCount={setCount}
					setGameRequests={setGameRequests}
					handlePopupClose={handlePopupClose}
				/>
			)}
		</li>
	);
};
