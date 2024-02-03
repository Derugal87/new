//by Raj
//right now cant figure out how to not have to click 'close' twice to close pop-up
import React, { useState, useEffect, useRef } from 'react';
import '../styles/NavigationBadge.style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faTimes } from '@fortawesome/free-solid-svg-icons';
import { io } from 'socket.io-client';

interface NotificationBadgeProps {
	notificationCounts: {
		[key: string]: number;
	};
	icon: string;
	iconClass: string;
	altText: string;
	badgeClass: string;
	popupContent: string;
	popupButtons: string[];
	updateNotificationCount: (badgeClass: string, count: number) => void;
	handleButtonClicked: (action: string) => void; // Add the handleButtonClick prop
	listUser: any;
	socket: any;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
	notificationCounts,
	icon,
	iconClass,
	altText,
	badgeClass,
	popupContent,
	popupButtons,
	updateNotificationCount,
	handleButtonClicked,
	listUser,
	socket,
}) => {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const popupRef = useRef<HTMLDivElement>(null);

	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	const [count, setCount] = useState<any>(0);

	useEffect(() => {
		console.log('notCount ', badgeClass, notificationCounts[badgeClass]);
		setCount(notificationCounts[badgeClass]);
	}, []);
	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleBadgeClick = () => {
		if (count > 0) setIsPopupOpen(true);
	};

	const handlePopupClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		// updateNotificationCount(badgeClass, 0); // Reset the count to zero
		setIsPopupOpen(false);
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
			setIsPopupOpen(false);
		}
	};

	const handleAccept = (e: React.MouseEvent, requestId: number) => {
		e.stopPropagation();
		if (!socket) return;
		socket.emit('acceptFriendRequest', { requestId: requestId });
		setIsPopupOpen(false);
		setCount((prev: any) => prev - 1);
	};

	const handleDecline = (e: React.MouseEvent, requestId: number) => {
		e.stopPropagation();
		if (!socket) return;
		socket.emit('deleteFriendRequest', { requestId: requestId });
		setIsPopupOpen(false);
	};

	console.log('counttt', badgeClass, count);
	return (
		<div className={`notification-badge ${badgeClass}`} onClick={handleBadgeClick}>
			<img src={icon} alt={altText} className={`icon ${iconClass}`} />
			{count > 0 && <span className="badge">{count}</span>}
			{isPopupOpen && (
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
						<p>{popupContent}</p>
					</div>
					<ul className="list-friends">
						{listUser &&
							listUser.map((item: any) => (
								<li key={item.user.id} className="friend-request-style">
									<div className="user-container">
										<img src={item.user.avatar} alt="notification" />
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
							))}
					</ul>

					<button
						className={`popup-close ${isHovered ? 'visible' : ''}`}
						onClick={handlePopupClose}
					>
						<FontAwesomeIcon icon={faTimes} />
					</button>
				</div>
			)}
		</div>
	);
};

export default NotificationBadge;
