import Container from '../components/Container';
import Header from '../components/Header';
import PersonalInfo from '../components/PersonalInfo';
import '../styles/ProfilePage.style.css';
import Tabs from '../components/Tabs';
import { ProfileUpdateProvider } from '../customContexts/ProfileUpdateContext';
import { glbLoginStore } from '../stores/loginAuth/loginStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HorizontalLine.style.css';
import { ValidationResult, useAuthUtils } from '../utils/authUtils';
import { useHookstate } from '@hookstate/core';
import { friend_req_data, friend_req_socket } from '../stores/notifications/FriendRequest.store';

import Modal from '../components/Modal'; // Adjust path as necessary
import TwoFactorSetup from '../components/TwoFactorSetup'; // Adjust path as necessary
import TwoFactorSetup2 from '../components/TwoFactorSetup2'; // Adjust path as necessary

export const HorizontalLine = () => {
	return <div className="horizontal-line"></div>;
};

export default function ProfilePage() {
	const navigate = useNavigate();
	const globalLoginStore = useHookstate(glbLoginStore);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading, true = authenticated, false = not authenticated

	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);

	const { isLoggedIn, get2FAStatus } = useAuthUtils('http://localhost:4000');

	const [is2FAEnabled, set2FAEnabled] = useState<boolean>(false);

	//to implement fetch2FAStatus

	useEffect(() => {
		const checkLogin = async () => {
			try {
				console.log('Checking login status...');
				const result = await isLoggedIn();
				console.log('Login status: ', result);
				if (!result.isValid) {
					navigate('/'); // Redirect to the login page if not logged in
					setIsAuthenticated(false);
				} else {
					setIsAuthenticated(true);
					const twoFAStatus = await get2FAStatus();
					set2FAEnabled(twoFAStatus);
					console.log('2FA status: ', twoFAStatus);
				}
			} catch (error) {
				console.error('Uhum, Error checking login', error);
				navigate('/');
				setIsAuthenticated(false);
			}
		};
		checkLogin();
	}, [isLoggedIn, navigate]); // Add dependencies here

	if (isAuthenticated === null) {
		return <div>Loading...</div>; // or some loading component
	}

	if (isAuthenticated === false) {
		return null; // or some error component
	}

	return (
		<Container>
			<ProfileUpdateProvider>
				<>
					<Header />
					<PersonalInfo />
					<HorizontalLine />
					<div style={{ textAlign: 'center' }}>
						<h2 className="Two_fa-title">Mobile App Authentication (2FA)</h2>
						<p>Secure your account with TOTP two-factor authentication</p>
						<button onClick={handleOpenModal} className="button-2fa">
							2FA Settings
						</button>
					</div>
					<HorizontalLine />
					<Tabs />

					{!is2FAEnabled ? (
						<Modal isOpen={isModalOpen} onClose={handleCloseModal}>
							<TwoFactorSetup
								id={Number(localStorage.getItem('user_id'))}
								nickname={'temporary_nickname'}
								baseUrl={'http://localhost:4000'}
							/>
						</Modal>
					) : (
						<Modal isOpen={isModalOpen} onClose={handleCloseModal}>
							<TwoFactorSetup2
								id={Number(localStorage.getItem('user_id'))}
								nickname={'temporary_nickname'}
								baseUrl={'http://localhost:4000'}
							/>
						</Modal>
					)}
				</>
			</ProfileUpdateProvider>
		</Container>
	);
}
