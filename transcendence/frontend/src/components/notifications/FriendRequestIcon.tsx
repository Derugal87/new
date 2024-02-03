import { useEffect, useRef, useState } from 'react';
import friendIcon from '../../images/userIcon.png';
import { useHookstate } from '@hookstate/core';
import { friend_req_data, friend_req_socket } from '../../stores/notifications/FriendRequest.store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';

type PopUpProps = {
	listUser: any;
	socket: any;
	setIsPopupOpen: (val: boolean) => void;
	setCount: (val: any) => void;
	handlePopupClose: (e: React.MouseEvent) => void;
	setFriendRequests: (val: any) => void;
};

const PopUpFriendRequests = ({
	listUser,
	socket,
	setIsPopupOpen,
	setCount,
	handlePopupClose,
	setFriendRequests,
}: PopUpProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const popupRef = useRef<HTMLDivElement>(null);
	const global_fr_req_data = useHookstate(friend_req_data);

	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const handleAccept = (e: React.MouseEvent, requestId: number) => {
		e.stopPropagation();
		if (!socket) return;
		socket.emit('acceptFriendRequest', { requestId: requestId, userId: currentUserId });
		setCount((prev: number) => prev - 1);
		global_fr_req_data.set((prevData: any) =>
			prevData.filter((user: any) => user.id !== requestId),
		);
		setIsPopupOpen(false);
	};

	const handleDecline = (e: React.MouseEvent, requestId: number) => {
		e.stopPropagation();
		if (!socket) return;
		socket.emit('deleteFriendRequest', { requestId: requestId, userId: currentUserId });
		setCount((prev: number) => prev - 1);
		global_fr_req_data.set((prevData: any) =>
			prevData.filter((user: any) => user.id !== requestId),
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
				<p>{`You have ${listUser.length} friend request`}</p>
			</div>
			<ul className="list-friends">
				{listUser &&
					listUser.map(
						(item: any) => (
							console.log('item:::', item),
							(
								<li key={item.user.id} className="friend-request-style">
									<div className="user-container">
										<img src={item?.user?.avatar} alt="notification" />
										<div className="user-nickname">{item.user.nickname}</div>
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

export const FriendRequestIcon = () => {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const global_fr_req_socket = useHookstate(friend_req_socket);
	const global_fr_req_data = useHookstate(friend_req_data);
	const [count, setCount] = useState(0);
	const [friendRequests, setFriendRequests] = useState<any>([]);

	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	useEffect(() => {
		if (global_fr_req_data.get() !== null) {
			setFriendRequests(global_fr_req_data.get());
			setCount(global_fr_req_data.get()?.length);
		}
	}, [global_fr_req_data]);

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
				<img src={friendIcon} alt="friendIcon" className={`icon`} />
				{count > 0 && <span className="badge">{count}</span>}
			</div>
			{isPopupOpen && (
				<PopUpFriendRequests
					listUser={friendRequests}
					socket={global_fr_req_socket.get()}
					setIsPopupOpen={setIsPopupOpen}
					setCount={setCount}
					setFriendRequests={setFriendRequests}
					handlePopupClose={handlePopupClose}
				/>
			)}
		</li>
	);
};
