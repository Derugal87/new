import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faArrowLeft, faSearch, faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import useStorageState from '../../customHooks/useStorageState';
import ChatTabs from './ChatTabs';
import { Channel, PropsCreateChan, User } from '../../models/Chat/Chat.interface';
import { CreateChannel } from './CreateChannel';
import { useHookstate } from '@hookstate/core';
import activeTab from '../../stores/chat/chatTabsStore';
import useFetch from '../../customHooks/useFetch';
import userInfo from '../../stores/chat/store';
import SearchChannelChatList from './SearchChannelChatList';
import SearchUserChatList from './SearchUserChatList';
import { SearchStore, searchList } from '../../stores/chat/chatSearchStore';
import ChatLists from './ChatLists';
import { io } from 'socket.io-client';

type ToggleButtonProps = {
	setInputValue: (str: string) => void;
};

const ToggleButton = ({ setInputValue }: ToggleButtonProps) => {
	const globalSearchStore = useHookstate(SearchStore);
	return globalSearchStore.get().arrow ? (
		<div
			className="toggle-button"
			onClick={() => {
				globalSearchStore.set({ isInputFocused: false, arrow: false });
				setInputValue('');
			}}
		>
			{/* {!globalSearchStore.get().isInputFocused && <FontAwesomeIcon icon={faBars} />} */}
			{globalSearchStore.get().arrow && <FontAwesomeIcon icon={faArrowLeft} />}
		</div>
	) : null;
};

type SearchBoxProps = {
	inputValue: string;
	setInputValue: (str: string) => void;
	handleInputValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const SearchBox = ({ inputValue, setInputValue, handleInputValue }: SearchBoxProps) => {
	const globalSearchStore = useHookstate(SearchStore);
	const globalActiveTab = useHookstate(activeTab);
	const globalSearchList = useHookstate(searchList);

	const { get } = useFetch('http://localhost:4000');

	const handleOnFocus = () => {
		globalSearchStore.set({ isInputFocused: true, arrow: true });
		if (globalActiveTab.get() === 'channels' && inputValue === '') {
			console.log('focus1');
			const userId = localStorage.getItem('user_id');
			get(`/channel-memberships/${userId}/user-channels`).then((data: any) => {
				const tmp = data.filter((item: any) => {
					console.log('item:', item);
					const channel = item?.channel;
					return item?.members?.length === 0 && !channel.password ? channel : null;
				});
				globalSearchList.set(tmp);
			});
		}
	};
	return (
		<div className={`search-box ${globalSearchStore.get().isInputFocused ? 'focus' : ''}`}>
			<label htmlFor="search">
				<i className="search-icon">
					<FontAwesomeIcon icon={faSearch} />
				</i>
				<input
					id="search"
					type="text"
					placeholder="Search"
					onFocus={handleOnFocus}
					value={inputValue}
					onChange={handleInputValue}
				/>
				{inputValue && (
					<i className="cancel-text">
						<FontAwesomeIcon icon={faTimes} onClick={() => setInputValue('')} />
					</i>
				)}
			</label>
		</div>
	);
};

const CreateChannelButton = ({ setCreateChannel }: PropsCreateChan) => {
	const globalActiveTab = useHookstate(activeTab);
	const globalUserInfo = useHookstate(userInfo);
	const [isHovered, setIsHovered] = useState(false);
	return (
		<NavLink
			to={`/chat/${globalActiveTab.get()}`}
			className="create-channel-button"
			onClick={() => {
				setCreateChannel(true);
				globalUserInfo.set(false);
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<FontAwesomeIcon icon={faPen} />
			{isHovered && (
				<span
					className="hover-text"
					style={{
						position: 'absolute',
						opacity: 1,
					}}
				>
					Create channel
				</span>
			)}
		</NavLink>
	);
};

type SearchListProps = {
	inputValue: string;
	setInputValue: (str: string) => void;
};

const SearchList = ({ inputValue, setInputValue }: SearchListProps) => {
	const globalActiveTab = useHookstate(activeTab);
	const globalSearchList = useHookstate(searchList);
	return (
		<>
			{globalSearchList.get() && globalActiveTab.get() === 'channels' && (
				<div className="body-container">
					<SearchChannelChatList setInputValue={setInputValue} />
				</div>
			)}
			{inputValue && searchList && globalActiveTab.get() === 'users' && (
				<div className="body-container">
					<SearchUserChatList setInputValue={setInputValue} />
				</div>
			)}
		</>
	);
};

type DataItem = User | Channel;

const ChatLeftSide = () => {
	const [inputValue, setInputValue] = useStorageState('search', '');
	const [createChannel, setCreateChannel] = useState(false);
	const globalSearchList = useHookstate(searchList);
	const globalUserInfo = useHookstate(userInfo);
	const globalActiveTab = useHookstate(activeTab);
	const globalSearchStore = useHookstate(SearchStore);
	const { get } = useFetch('http://localhost:4000');

	const param = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const handleEscapeKey = (event: any) => {
			if (event.key === 'Escape') {
				navigate(`/chat/${globalActiveTab.get()}`);
				globalUserInfo.set(false);
			}
		};
		window.addEventListener('keydown', handleEscapeKey);
		return () => {
			window.removeEventListener('keydown', handleEscapeKey);
		};
	}, [navigate]);

	useEffect(() => {
		if (!param?.id) {
			navigate(`/chat/${globalActiveTab.get()}`);
			globalUserInfo.set(false);
		}
	}, [globalActiveTab.get()]);

	const handleInputValue = async (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
		if (event.target.value === '') {
			const userId = localStorage.getItem('user_id');
			get(`/channel-memberships/${userId}/user-channels`).then((data: any) => {
				const tmp = data.filter((item: any) => {
					const channel = item?.channel;
					return item?.members?.length === 0 && !channel.password ? channel : null;
				});
				globalSearchList.set(tmp);
			});
			return;
		}
		const userId = localStorage.getItem('user_id');
		const endpoint =
			globalActiveTab.get() === 'users' ? '/user' : `/channel-memberships/${userId}/user-channels`;
		const data = await get(endpoint);

		const typedData = data as DataItem[];

		const searchValue = event.target.value.toLowerCase();
		const searchResult = typedData.filter((item) => {
			if (globalActiveTab.get() === 'users') {
				const userItem = item as User;
				return userItem.nickname.toLowerCase().includes(searchValue);
			} else {
				const channelItem = item as any;
				return channelItem.channel.name.toLowerCase().includes(searchValue);
			}
		});
		console.log('rt:', searchResult);
		globalSearchList.set(searchResult);
	};

	if (!createChannel) {
		return (
			<div
				className="left-side"
				data-globaluserinfo={globalUserInfo.get()}
				data-paramid={param.id !== undefined}
			>
				<div className="sidebar-header">
					<ToggleButton setInputValue={setInputValue} />
					<SearchBox
						inputValue={inputValue}
						setInputValue={setInputValue}
						handleInputValue={handleInputValue}
					/>
				</div>
				{globalSearchStore.isInputFocused.get() && (
					<SearchList inputValue={inputValue} setInputValue={setInputValue} />
				)}
				<ChatTabs />
				<ChatLists />
				<CreateChannelButton setCreateChannel={setCreateChannel} />
			</div>
		);
	} else return <CreateChannel setCreateChannel={setCreateChannel} />;
};
export default ChatLeftSide;
