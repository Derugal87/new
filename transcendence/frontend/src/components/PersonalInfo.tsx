import callMade from '../images/callMade.png';
import callRecieved from '../images/callReceived.png';
import '../styles/PersonalInfo.style.css';
import { useState, useEffect } from 'react';
import ProfileEditPopup from './ProfileEditPopup';
import useFetch from '../customHooks/useFetch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { useHookstate } from '@hookstate/core';
import { glbUserStore } from '../stores/user/userStore';

export default function PersonalInfo() {
	const [isOpen, setIsOpen] = useState(false);
	const [userInfo, setUserInfo] = useState<any>(null);
	const { get, loading } = useFetch('http://localhost:4000');
	const getLocalStorageUser = localStorage.getItem('user');
	const globalUserStore = useHookstate(glbUserStore);

	useEffect(() => {
		const user_id = localStorage.getItem('user_id');
		get(`/user/${user_id}`)
			.then((data) => {
				console.log('data:', data);
				setUserInfo(data);
			})
			.catch((e) => console.error(e));
		get(`/user/${user_id}/wins-losses`)
			.then((data: any) => {
				setUserInfo((prev: any) => {
					return { ...prev, ...data };
				});
			})
			.catch((e) => console.error(e));
	}, [globalUserStore]);

	const handleOpenPopUpClick = () => {
		setIsOpen(true);
	};

	const handleClosePopUpClick = () => {
		setIsOpen(false);
	};
	if (userInfo) {
		console.log('userInfo:', userInfo);
	}

	return (
		<div className="personal-info">
			{userInfo && (
				<div className="personal-info-box">
					<img src={userInfo.avatar} alt="Profile" className="personal-img" />
					<h2 className="personal-info-box-nick">{userInfo.nickname}</h2>
					<h3>Points: {userInfo.points}</h3>
					<h3>
						Wins: {userInfo.wins}{' '}
						<span>
							<img src={callMade} alt="callMade" className="callMade" />
						</span>
					</h3>
					<h3>
						Defeats: {userInfo.losses}{' '}
						<span>
							<img src={callRecieved} alt="callRecieved" className="callRecieved" />
						</span>
					</h3>
					<button className="edit-icon" onClick={handleOpenPopUpClick}>
						<FontAwesomeIcon icon={faEdit} className="custom-icon" />
					</button>
					{isOpen && (
						<ProfileEditPopup isHomePage={false} onClosePopUpClick={handleClosePopUpClick} />
					)}
				</div>
			)}
		</div>
	);
}
