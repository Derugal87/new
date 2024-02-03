import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import PopUp from '../PopUp';
import { useHookstate } from '@hookstate/core';
import userInfo from '../../stores/chat/store';
import { direct_msg_data } from '../../stores/chat/chatDirectMsgStore';

const ChatListUser = () => {
	const [showPopup, setShowPopup] = useState(false);
	const [popupX, setPopupX] = useState(0);
	const [popupY, setPopupY] = useState(0);
	const [rightClickedChatId, setRightClickedChatId] = useState<number | null>(null);
	const [data, setData] = useState<any | null>(null);
	const globalUserInfo = useHookstate(userInfo);
	const globalDirectMsgData = useHookstate(direct_msg_data);
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const param = useParams();
	const id = param.id ? Number.parseInt(param.id, 10) : null;

	useEffect(() => {
		if (globalDirectMsgData && globalDirectMsgData.get()) {
			const { directMessageRecipients, friends } = globalDirectMsgData.get();
			setData([...directMessageRecipients, ...friends]);
		}
	}, [globalDirectMsgData]);

	const handleUserClick = (index: number) => {
		console.warn(`click user id ${index}`);
		globalUserInfo.set(false);
	};

	const handleRightClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, id: number) => {
		event.preventDefault();
		setShowPopup(true);
		setRightClickedChatId(id);

		setPopupX(event.clientX);
		setPopupY(event.clientY);
	};

	const handleClosePopup = () => {
		setShowPopup(false);
	};

	if (!data) return null;
	return (
		<div className="body-container">
			<div className="chat-list">
				{data.map((item: any) => {
					return (
						<NavLink
							key={item.user.id}
							to={`/chat/users/${item.user.id}`}
							className={({ isActive }) =>
								isActive ? 'chat-box-anchor active' : 'chat-box-anchor'
							}
						>
							<div
								key={item.user.id}
								className={`chat-box ${
									showPopup && rightClickedChatId === item.user.id ? 'selected' : ''
								}`}
								id="Msg"
								onClick={() => handleUserClick(item.user.id)}
								onContextMenu={(event) => handleRightClick(event, item.user.id)}
							>
								<div className="chat-img">
									<img src={item.user.avatar} alt="salom" />
								</div>
								<div className="chat-details">
									<div className="chat-title">
										{currentUserId === item.user.id ? (
											<h3>{item.user.nickname + ` (you)`}</h3>
										) : (
											<h3>{item.user.nickname}</h3>
										)}
										{id === null &&
											item.unreadMessagesCount > 0 &&
											item.user.id !== currentUserId && (
												<div className="notification-span">{item.unreadMessagesCount}</div>
											)}
									</div>
								</div>
							</div>
						</NavLink>
					);
				})}
				{showPopup && currentUserId !== rightClickedChatId && (
					<PopUp
						Channels={null}
						Users={data}
						x={popupX - 180}
						y={popupY - 80}
						onClose={handleClosePopup}
						rightClickedChatId={rightClickedChatId}
					/>
				)}
			</div>
		</div>
	);
};

export default ChatListUser;
