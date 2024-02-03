import { faBan, faUnlock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import useFetch from '../customHooks/useFetch';
import '../styles/Tabs.style.css';
import { useProfileUpdateContext } from '../customContexts/ProfileUpdateContext';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { TableItem } from '../models/Table/Table.interface';
import { Console } from 'console';
import { useHookstate } from '@hookstate/core';
import { friend_req_socket } from '../stores/notifications/FriendRequest.store';

interface TableProps {
	tableData: TableItem[];
}

const TableContent = ({ tableData }: TableProps) => {
	const navigate = useNavigate();
	const { post, get } = useFetch('http://localhost:4000');
	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	const [friendshipData, setFriendshipData] = useState<any>([]);
	const [blockedData, setBlockedData] = useState<any>([]);
	const global_fr_req_socket = useHookstate(friend_req_socket);

	useEffect(() => {
		// Fetch friendship data for compare to show or hide friendRequest icon
		get(`/friendships/friends/${currentUserId}`)
			.then((data) => {
				setFriendshipData(data);
			})
			.catch((e) => console.error('fetching my friends error', e));

		// Fetch Blocked data for compare to show or hide Block icon
		get(`/user/${currentUserId}/blocked-friends`)
			.then((data) => {
				setBlockedData(data);
			})
			.catch((e) => console.error('fetching my friends error', e));
	}, []);

	const handleFriendRequest = async (event: React.MouseEvent, newFriendId: number) => {
		event.stopPropagation();
		const sending_data = {
			senderId: currentUserId,
			receiverId: newFriendId,
		};
		console.log('sending_data', sending_data);
		global_fr_req_socket.get().emit('sendFriendRequest', sending_data);
	};

	const handleBlockUser = (event: React.MouseEvent, userId: number) => {
		event.stopPropagation();
		post(`/blocking/block/${currentUserId}`, { blockedUserId: userId })
			.then((data) => console.log('blocked user', data))
			.catch((e) => console.error('blocked user error', e));
	};

	const handleUnlockUser = (event: React.MouseEvent, userId: number) => {
		event.stopPropagation();
		post(`/blocking/unblock/${currentUserId}`, { unblockedUserId: userId })
			.then((data) => console.log('unblockedUserId user', data))
			.catch((e) => console.error('unblockedUserId user error', e));
	};

	const handleShowFriend = (id: number) => {
		navigate(`/friend/${id}`);
	};

	return (
		<table className="table">
			<thead>
				<tr>
					<th>Rank</th>
					<th>Nickname</th>
					<th>Points</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{tableData &&
					tableData.map((item, idd: number) => {
						const isFriend = friendshipData.some((user_id: any) => user_id.id === item.id);
						const isBlocked = blockedData.some((user_id: any) => user_id.id === item.id);
						return (
							<tr key={item.id} className="row-style" onClick={() => handleShowFriend(item.id)}>
								<td>{idd + 1}</td>
								<td>{item.nickname}</td>
								<td>{item.points}</td>
								<td style={{ width: '100px' }}>
									<div className="table-icons">
										{currentUserId !== item.id && (
											<>
												{!isFriend && (
													<div
														className="add-friend-icon"
														onClick={(e) => handleFriendRequest(e, item.id)}
													>
														<FontAwesomeIcon icon={faUserPlus} />
														<span className="label">Add Friend</span>
													</div>
												)}
												{!isBlocked && (
													<div
														className="add-friend-icon"
														onClick={(e) => handleBlockUser(e, item.id)}
													>
														<FontAwesomeIcon icon={faBan} />
														<span className="label">Block user</span>
													</div>
												)}
												{isBlocked && (
													<div
														className="add-friend-icon"
														onClick={(e) => handleUnlockUser(e, item.id)}
													>
														<FontAwesomeIcon icon={faUnlock} />
														<span className="label">Unlock user</span>
													</div>
												)}
											</>
										)}
									</div>
								</td>
							</tr>
						);
					})}
			</tbody>
		</table>
	);
};

interface TableFriends {
	tableData: any;
}

const TableContentFriends = ({ tableData }: TableFriends) => {
	const navigate = useNavigate();
	const { post, get } = useFetch('http://localhost:4000');
	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const handleShowFriend = (id: number) => {
		navigate(`/friend/${id}`);
	};

	return (
		<table className="table">
			<thead>
				<tr>
					<th>Id</th>
					<th>Nickname</th>
					<th>Points</th>
				</tr>
			</thead>
			<tbody>
				{tableData &&
					tableData.map((item: any) => {
						return (
							<tr key={item.id} className="row-style" onClick={() => handleShowFriend(item.id)}>
								<td>{item.id}</td>
								<td>{item.nickname}</td>
								<td>{item?.points}</td>
							</tr>
						);
					})}
			</tbody>
		</table>
	);
};

interface TableMatchHistory {
	tableData: any;
}

const TableContentMatchHistory = ({ tableData }: TableMatchHistory) => {
	const navigate = useNavigate();
	const { post, get } = useFetch('http://localhost:4000');
	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const handleShowFriend = (id: number) => {
		navigate(`/friend/${id}`);
	};

	return (
		<table className="table">
			<thead>
				<tr>
					<th>My Nickname</th>
					<th>Result</th>
					<th>Opponent Nickname</th>
				</tr>
			</thead>
			<tbody>
				{tableData &&
					tableData.map((item: any) => {
						const resultString = item?.result;
						const resultArray = resultString?.split('-').map(Number);

						if (item?.creator?.id === currentUserId) {
							return (
								<tr
									key={item.id}
									className="row-style"
									onClick={() => handleShowFriend(item?.joiner?.id)}
								>
									<td>{item?.creator?.nickname}</td>
									<td>{resultArray ? `${resultArray[0]} - ${resultArray[1]}` : null}</td>
									<td>{item?.joiner?.nickname}</td>
								</tr>
							);
						}
						return (
							<tr
								key={item.id}
								className="row-style"
								onClick={() => handleShowFriend(item.creator?.id)}
							>
								<td>{item?.joiner?.nickname}</td>
								<td>{resultArray ? `${resultArray[1]} - ${resultArray[0]}` : null}</td>
								<td>{item?.creator?.nickname}</td>
							</tr>
						);
					})}
			</tbody>
		</table>
	);
};

interface TableAchievements {
	tableData: any;
}

const TableContentAchievements = ({ tableData }: TableAchievements) => {
	const navigate = useNavigate();
	const { post, get } = useFetch('http://localhost:4000');
	let currentUserId: any = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	const handleShowFriend = (id: number) => {
		navigate(`/friend/${id}`);
	};

	return (
		<table className="table">
			<thead>
				<tr>
					<th>Id</th>
					<th>Achievements</th>
				</tr>
			</thead>
			<tbody>
				{tableData &&
					tableData.map((item: any, id: number) => {
						let text = item;
						switch (item) {
							case 'First match':
								text = text + ' (🏁)';
								break;
							case 'First win':
								text = text + ` (🎉)`;
								break;
							case '10 matches played':
								text = text + ` (🔟)`;
								break;
							case '100 matches played':
								text = text + ` (💯)`;
								break;
							case 'Perfect victory':
								text = text + ` (🏆)`;
								break;
							case 'Perfect defeat':
								text = text + ` (☠️)`;
								break;
							case '10 wins':
								text = text + ` (🔟)`;
								break;
							case 'Hit rock bottom':
								text = text + ` (🪣)`;
								break;
							case 'Outperformer':
								text = text + ` (🚀)`;
								break;
						}
						return (
							<tr key={id} className="row-style">
								<td>{id + 1}</td>
								<td>{text}</td>
							</tr>
						);
					})}
			</tbody>
		</table>
	);
};

interface TabData {
	title: string;
	content: JSX.Element;
}

const Tabs = () => {
	const [activeTab, setActiveTab] = useState(0);
	const { get } = useFetch('http://localhost:4000');
	const [tableData, setTableData] = useState<any | null>(null);
	const [achievementsData, setAchievementsData] = useState<any | null>(null);
	const context = useProfileUpdateContext();
	let currentUserId: any = localStorage.getItem('user_id');

	useEffect(() => {
		const titles: string[] = ['user', 'friend', 'blocked', 'leaderboard', 'match_history'];
		if (activeTab === 0) {
			get(`/user`)
				.then((data: any) => {
					console.log('leaderboard:', data);
					const res = data.sort((a: any, b: any) => b.points - a.points);
					setTableData(res);
				})
				.catch((e) => console.error(e));
		} else if (activeTab === 1) {
			get(`/friendships/friends/${currentUserId}`)
				.then((data: any) => {
					console.log('frined,', data);
					setTableData(data);
				})
				.catch((e) => console.error(e));
		} else if (activeTab === 2) {
			get(`/user/${currentUserId}/blocked-friends`)
				.then((data: any) => {
					console.log('blocked,', data);
					setTableData(data);
				})
				.catch((e) => console.error(e));
		} else if (activeTab === 3) {
			get(`/match/user/${currentUserId}`)
				.then((data: any) => {
					console.log('match_history,', data);
					setTableData(data);
				})
				.catch((e) => console.error(e));
		} else if (activeTab === 4) {
			get(`/user/${currentUserId}/achievements`)
				.then((data: any) => {
					console.log('achievements:', data);
					setAchievementsData(data);
				})
				.catch((e) => console.error(e));
		}
	}, [activeTab, context.data]);
	const handleTabClick = (index: number) => {
		setActiveTab(index);
	};

	const tabData: TabData[] = [
		{ title: 'Leaderboard', content: <TableContent tableData={tableData} /> },
		{ title: 'Friends', content: <TableContentFriends tableData={tableData} /> },
		{ title: 'Blocked', content: <TableContentFriends tableData={tableData} /> },
		{
			title: 'Match history',
			content: <TableContentMatchHistory tableData={tableData} />,
		},
		{ title: 'Achievements', content: <TableContentAchievements tableData={achievementsData} /> },
	];

	return (
		<div className="tabs">
			<div className="tab-header">
				{tabData.map((tab, index) => (
					<div
						key={index}
						className={`tab ${index === activeTab ? 'active' : ''}`}
						onClick={() => handleTabClick(index)}
					>
						{tab.title}
					</div>
				))}
			</div>
			<div className="tab-content">{tabData[activeTab].content}</div>
		</div>
	);
};

export default Tabs;
