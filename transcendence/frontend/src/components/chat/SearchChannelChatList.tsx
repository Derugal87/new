import { useNavigate } from 'react-router-dom';
import { Channel, User } from '../../models/Chat/Chat.interface';
import { useHookstate } from '@hookstate/core';
import activeTab from '../../stores/chat/chatTabsStore';
import '../../styles/SearchChatList.style.css';
import useFetch from '../../customHooks/useFetch';
import { useState } from 'react';
import { SearchStore, searchList } from '../../stores/chat/chatSearchStore';
import { group_msg_socket } from '../../stores/chat/chatGroupMsgStore';

interface Props {
	setInputValue: (str: string) => void;
}

const SearchChannelChatList = ({ setInputValue }: Props) => {
	const { post } = useFetch('http://localhost:4000');
	const globalActiveTab = useHookstate(activeTab);
	const globalSearchStore = useHookstate(SearchStore);
	const globalSearchList = useHookstate(searchList);
	const globalGroupMsgSocket = useHookstate(group_msg_socket);
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	const navigate = useNavigate();
	const [password, setPassword] = useState('');

	const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};
	const handleUserClick = (index: number, e: React.MouseEvent) => {
		e.stopPropagation();
		console.warn(`click user id ${index}`);
		globalSearchStore.set({ isInputFocused: false, arrow: false });
		globalSearchList.set([]);
		setInputValue('');
		globalGroupMsgSocket
			.get()
			?.emit('joinChannel', { channelId: index, userId: currentUserId, password: password });
	};

	const handleRedirectChannel = (membership: any, id: number) => {
		if (membership) {
			navigate(`/chat/channels/${id}`);
			globalSearchStore.set({ isInputFocused: false, arrow: false });
			globalSearchList.set([]);
			setInputValue('');
		}
	};

	return (
		<div className="chat-list">
			{globalSearchList.get() &&
				globalSearchList.get().map((item: any) => {
					const channel = item?.channel;
					const membership = item?.members.find((item: any) => item.user.id === currentUserId);
					return (
						<div
							key={channel.id}
							className="chat-box-anchor"
							onClick={() => handleRedirectChannel(membership, channel.id)}
						>
							<div key={channel.id} className={`chat-box1`} id="Msg">
								{/* <div className="chat-img">
								<img src={channel.avatar} alt="salom" />
							</div> */}
								<div className="chat-details">
									<div className="chat-title">
										<h3>{channel.name}</h3>
									</div>
								</div>
								{globalActiveTab.get() === 'channels' && !membership && (
									<div className="join-channel">
										{channel.password && (
											<input
												type="password"
												onChange={handlePasswordInput}
												placeholder="Enter password"
											/>
										)}
										<button onClick={(e) => handleUserClick(channel.id, e)} className="join-button">
											Join
										</button>
									</div>
								)}
							</div>
						</div>
					);
				})}
		</div>
	);
};

export default SearchChannelChatList;

// to={`/chat/${globalActiveTab.get()}/${channel.id}`}
