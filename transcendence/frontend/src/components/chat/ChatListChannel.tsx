import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import PopUp from '../PopUp';
import { useHookstate } from '@hookstate/core';
import userInfo from '../../stores/chat/store';
import { channel_membership_data } from '../../stores/chat/channelMembershipStore';

const ChatListChannel = () => {
	const [showPopup, setShowPopup] = useState(false);
	const [popupX, setPopupX] = useState(0);
	const [popupY, setPopupY] = useState(0);
	const [rightClickedChatId, setRightClickedChatId] = useState<number | null>(null);
	const globalUserInfo = useHookstate(userInfo);
	const [data, setData] = useState<any>(null);

	const param = useParams();
	const id = param.id ? Number.parseInt(param.id, 10) : null;
	const currentUserId = localStorage.getItem('user_id');
	const globalChanMembershipData = useHookstate(channel_membership_data);

	useEffect(() => {
		if (globalChanMembershipData && globalChanMembershipData.get()) {
			setData(globalChanMembershipData.get());
		}
	}, [globalChanMembershipData]);

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
							key={item?.membership?.channel.id}
							to={`/chat/channels/${item?.membership?.channel.id}`}
							className={({ isActive }) =>
								isActive ? 'chat-box-anchor active' : 'chat-box-anchor'
							}
						>
							<div
								className={`chat-box ${
									showPopup && rightClickedChatId === item?.membership?.channel.id ? 'selected' : ''
								}`}
								id="Msg"
								onClick={() => handleUserClick(item?.membership?.channel.id)}
								onContextMenu={(event) => handleRightClick(event, item?.membership?.channel.id)}
							>
								<div className="chat-img">
									<img src={item?.membership?.channel?.avatar} alt="salom" />
								</div>
								<div className="chat-details">
									<div className="chat-title">
										<h3>{item?.membership?.channel?.name}</h3>
										{/* {id === null && item?.unreadMessagesCount > 0 && (
											<div className="notification-span">{item?.unreadMessagesCount}</div>
										)} */}
									</div>
								</div>
							</div>
						</NavLink>
					);
				})}
				{showPopup && (
					<PopUp
						Users={null}
						Channels={data}
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

export default ChatListChannel;
