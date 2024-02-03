import { NavLink } from 'react-router-dom';
import { useHookstate } from '@hookstate/core';
import activeTab from '../../stores/chat/chatTabsStore';
import '../../styles/SearchChatList.style.css';
import { SearchStore, searchList } from '../../stores/chat/chatSearchStore';

interface Props {
	setInputValue: (str: string) => void;
}

const SearchUserChatList = ({ setInputValue }: Props) => {
	const globalActiveTab = useHookstate(activeTab);
	const globalSearchStore = useHookstate(SearchStore);
	const globalSearchList = useHookstate(searchList);

	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const handleUserClick = (index: number) => {
		console.warn(`click user id ${index}`);
		globalSearchStore.set({ isInputFocused: false, arrow: false });
		globalSearchList.set([]);
		setInputValue('');
	};

	return (
		<div className="chat-list">
			{globalSearchList.get() &&
				globalSearchList.get().map((item: any) => {
					return (
						<NavLink
							key={item.id}
							to={`/chat/${globalActiveTab.get()}/${item.id}`}
							className={({ isActive }) =>
								isActive ? 'chat-box-anchor active' : 'chat-box-anchor'
							}
						>
							<div
								key={item.id}
								className={`chat-box`}
								id="Msg"
								onClick={() => handleUserClick(item.id)}
							>
								<div className="chat-img">
									<img src={item.avatar} alt="salom" />
								</div>
								<div className="chat-details">
									<div className="chat-title">
										<h3>
											{item.nickname}
											{item.id === currentUserId ? ' (You)' : ''}
										</h3>
									</div>
								</div>
							</div>
						</NavLink>
					);
				})}
		</div>
	);
};
export default SearchUserChatList;
