import { faGamepad, faRocket, faStar, faTimes, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../../styles/chatRightSide.style.css';
import { useHookstate } from '@hookstate/core';
import userInfo from '../../stores/chat/store';
import { useEffect, useState } from 'react';
import useFetch from '../../customHooks/useFetch';
import activeTab from '../../stores/chat/chatTabsStore';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { CustomLoader } from '../utils/Loader';
import CopyToClipboard from '../utils/CopyToClipboard';
import {
	channel_membership_data,
	channel_membership_socket,
} from '../../stores/chat/channelMembershipStore';
import { useGameSocket } from '../../customContexts/gameSocketContext';
import { gameState } from '../../stores/game/gameStore';
import { glbIsInviting } from '../../stores/game/isInvitingStore';

const DropDownToggle = (props: any) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const { item, targetUserId, channelId } = props;
	const { post, put, del } = useFetch('http://localhost:4000');

	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	const toggleDropdown = () => {
		setIsDropdownOpen(!isDropdownOpen);
	};

	const stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handleKickUser = () => {
		del(`/channel-memberships/${channelId}/${currentUserId}/${targetUserId}`)
			.then((data) => console.log('deleted user', data))
			.catch((e) => console.error('error in deleting user', e));
	};
	const handleBanUser = () => {
		post(`/channel-memberships/${channelId}/ban`, {
			currentUserId,
			targetUserId,
		})
			.then((data) => console.log('baned user', data))
			.catch((e) => console.error(e));
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleMuteUser = () => {
		post(`/channel-memberships/${channelId}/mute`, {
			currentUserId,
			targetUserId,
		})
			.then((data) => console.log('muted user', data))
			.catch((e) => console.error(e));
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleSetAdmin = () => {
		put(`/channel-memberships/${currentUserId}/${targetUserId}/${channelId}`, {
			role: 'administrator',
		})
			.then((data) => {
				console.log(data);
			})
			.catch((e) => console.error(e));
		setIsDropdownOpen(!isDropdownOpen);
	};

	const handleSetMember = () => {
		put(`/channel-memberships/${currentUserId}/${targetUserId}/${channelId}`, {
			role: 'member',
		})
			.then((data) => {
				console.log(data);
			})
			.catch((e) => console.error(e));
		setIsDropdownOpen(!isDropdownOpen);
	};

	return item.membership.role !== 'channel_owner' ? (
		<div className="dropdown" onClick={stopPropagation}>
			<div className="action-dropdown">
				<button className="action-button dropdown-button" onClick={toggleDropdown}>
					&#8285;
				</button>
				{isDropdownOpen && (
					<div className="dropdown-content">
						<button onClick={handleKickUser}>Kick</button>
						<button onClick={handleBanUser}>Ban</button>
						<button onClick={handleMuteUser}>Mute</button>
						{item.membership.role === 'member' && (
							<button onClick={handleSetAdmin}>Set Admin</button>
						)}
						{item.membership.role === 'administrator' && (
							<button onClick={handleSetMember}>Set Member</button>
						)}
					</div>
				)}
			</div>
		</div>
	) : null;
};

const ChannelMembersList = (props: any) => {
	const [myRole, setMyRole] = useState('');
	const globalUserInfo = useHookstate(userInfo);
	const socket = useGameSocket();
	const globalGameState = useHookstate(gameState);
	const globalIsInviting = useHookstate(glbIsInviting);
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);
	useEffect(() => {
		console.log(props.data);
		const tmp = props.data.members.find((item: any) => item.user.id === currentUserId);
		setMyRole(tmp.membership.role);
	}, []);

	const navigate = useNavigate();
	const handleShowFriend = (id: number) => {
		navigate(`/friend/${id}`);
	};

	const handleInviteGame = (e: React.MouseEvent, inviteeId: number) => {
		e.stopPropagation();
		globalIsInviting.set({
			isInviting: true,
			inviteeId: inviteeId,
		});
		navigate('/game/settings');
	};

	return (
		<div className="channel-members">
			{props.data.channel.is_public === false && (
				<CopyToClipboard joinToken={props.data.channel.joinToken} />
			)}
			<h3>Channel Members</h3>
			<ul style={{ paddingLeft: '10px' }}>
				{props.data.members.map((item: any) => {
					return (
						<li key={item.user.id} className="member">
							<div className={`nav-friend-profile`} onClick={() => handleShowFriend(item.user.id)}>
								<div className="member-details">
									<img src={item.user.avatar} alt={item.user.nickname} className="member-avatar" />
									<div className="member-nickname">{item.user.nickname}</div>
									<div className="member-role">
										{item.membership.role === 'channel_owner' ? 'Owner' : item.membership.role}
									</div>
								</div>
								{item.user.id !== currentUserId && (
									<div className="invite-game" onClick={(e) => handleInviteGame(e, item.user.id)}>
										<FontAwesomeIcon icon={faGamepad} />
										<span className="game-icon-tooltip">Game Invitation</span>
									</div>
								)}
								{myRole !== 'member' && item.user.id !== currentUserId && (
									<DropDownToggle
										item={item}
										targetUserId={item.user.id}
										channelId={props.data.channel.id}
									/>
								)}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

const LoadingComponent = () => {
	const globalUserInfo = useHookstate(userInfo);
	const param = useParams();
	return (
		<div
			className="right-side"
			data-globaluserinfo={globalUserInfo.get()}
			data-paramid={param.id !== undefined}
		>
			<CustomLoader />
		</div>
	);
};
const UserDetails = (props: any) => {
	console.log(props);
	const globalUserInfo = useHookstate(userInfo);
	const param = useParams();
	return (
		<div
			className="right-side"
			data-globaluserinfo={globalUserInfo.get()}
			data-paramid={param.id !== undefined}
		>
			<div className="header-user-info">
				<button className="cancel-user-info" onClick={() => globalUserInfo.set(false)}>
					<FontAwesomeIcon icon={faTimes} className="close-faTimes" />
				</button>
				<h3>User Info</h3>
			</div>
			<div className="data-user-info">
				<img src={props.data.avatar} alt="something" />
				<h4>{props.data.nickname}</h4>
			</div>
		</div>
	);
};

const ChannelDetails = (props: any) => {
	const globalUserInfo = useHookstate(userInfo);
	const param = useParams();
	return (
		<div
			className="right-side"
			data-globaluserinfo={globalUserInfo.get()}
			data-paramid={param.id !== undefined}
		>
			<div className="header-user-info">
				<button className="cancel-user-info" onClick={() => globalUserInfo.set(false)}>
					<FontAwesomeIcon icon={faTimes} className="close-faTimes" />
				</button>
				<h3>Channel Info</h3>
			</div>
			<h3 style={{ display: 'flex', justifyContent: 'center' }}>{props.data.channel.name}</h3>
			<div className="data-user-info">
				{/* <img src={props.data.channel.avatar} alt="something" /> */}
			</div>
			<ChannelMembersList {...props} />
		</div>
	);
};

type Props = {
	id: number | null;
};

export default function ChatRightSide({ id }: Props) {
	const globalActiveTab = useHookstate(activeTab);
	const [data, setData] = useState<any>(null);
	const globalChanMembershipSocket = useHookstate(channel_membership_socket);
	const globalChanMembershipData = useHookstate(channel_membership_data);
	let currentUserId: string | number | null = localStorage.getItem('user_id');
	if (currentUserId) currentUserId = parseInt(currentUserId, 10);

	useEffect(() => {
		if (!globalChanMembershipSocket.get()) return;
		if (globalActiveTab.get() === 'channels') {
			console.log('awrsone');
			globalChanMembershipSocket
				.get()
				.emit('getChannelMembersWithMembership', { channelId: id, userId: currentUserId });
		}
	}, []);

	useEffect(() => {
		if (!globalChanMembershipSocket.get()) return;
		globalChanMembershipSocket
			.get()
			.emit('getChannelMembersWithMembership', { channelId: id, userId: currentUserId });
		globalChanMembershipSocket.get().on('channelMembersWithMembership', (data: any) => {
			setData(data);
		});
	}, [globalChanMembershipSocket, globalChanMembershipData]);

	if (!data) return <LoadingComponent />;
	if (globalActiveTab.get() === 'users') {
		return <UserDetails data={data} />;
	} else {
		return <ChannelDetails data={data} />;
	}
}
