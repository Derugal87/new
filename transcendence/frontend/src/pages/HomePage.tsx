import { useEffect, useState } from 'react';
import Container from '../components/Container';
import Header from '../components/Header';
import ProfileEditPopup from '../components/ProfileEditPopup';
import '../styles/HomePage.style.css';
import TeamMember from '../components/utils/TeamMember';
import { ProfileUpdateProvider } from '../customContexts/ProfileUpdateContext';
import useStorageState from '../customHooks/useStorageState';
import { glbLoginStore } from '../stores/loginAuth/loginStore';
import { useNavigate } from 'react-router-dom';
import { useAuthUtils } from '../utils/authUtils';
import { useHookstate } from '@hookstate/core';
import ProfilePopup from '../components/ProfilePopUp';

const teamMembers1 = [
	{
		name: 'Ulugbek Isroilov',
		role: 'Frontend Lead',
		linkedin: 'https://www.linkedin.com/in/ulugbek989898/',
		github: 'https://github.com/ulugbek989898',
		imageSrc: require('../homepage_assets/ulugbek.jpg'),
	},
	{
		name: 'Oğuz Aydemir',
		role: 'Backend Lead',
		linkedin: 'https://www.linkedin.com/in/ouaydemir/',
		github: 'https://github.com/user8674',
		imageSrc: require('../homepage_assets/oz.jpg'),
	},
];

const teamMembers2 = [
	{
		name: 'Aliaksandr Dziaruha',
		role: 'Frontend',
		linkedin: 'https://www.linkedin.com/in/alexander-derugo/',
		github: 'https://github.com/derugal87',
		imageSrc: require('../homepage_assets/alex.jpg'),
	},
	{
		name: 'Chinedu Egbulefu',
		role: 'Backend',
		linkedin: 'https://www.linkedin.com/in/chinedu-egbulefu-59169035/',
		github: 'https://github.com/ChineduGboof',
		imageSrc: require('../homepage_assets/chinedu.jpg'),
	},
];

export const HomePage = () => {
	const [isOpen, setIsOpen] = useState(true);
	const [isNew, setIsNew] = useStorageState('isNew', 'false');
	const globalLoginStore = useHookstate(glbLoginStore);
	const navigate = useNavigate();
	const { isLoggedIn } = useAuthUtils('http://localhost:4000');

	useEffect(() => {
		const checkLogin = async () => {
			try {
				const result = await isLoggedIn();
				if (!result.isValid) {
					navigate('/'); // Redirect to the login page if not logged in
				} else {
				}
			} catch (error) {
				console.error('Error checking login', error);
			}
		};
		checkLogin();
	}, [isLoggedIn, navigate]); // Add dependencies here

	useEffect(() => {
		// if (!loginStore.get()) {
		// 	navigate('/');
		// }
		const queryString = window.location.search;
		const params = new URLSearchParams(queryString);
		if (params.get('isNew')) {
			if (params.get('isNew') === 'false') {
				globalLoginStore.set(true);
			}
			setIsNew(params.get('isNew') === 'true' ? 'true' : 'false');
			localStorage.setItem('id_42', params.get('id_42') || '');
			localStorage.setItem('user_id', params.get('id') || '');
			localStorage.setItem('token', params.get('token') || '');
			localStorage.setItem('refreshToken', params.get('refreshToken') || '');
		}
	}, []);

	const handleClosePopUpClick = () => {
		setIsOpen(false);
	};

	return (
		<Container>
			<>
				<Header />
				<ProfileUpdateProvider>
					{isOpen && isNew === 'true' && !globalLoginStore.get() && (
						<ProfilePopup isHomePage={true} onClosePopUpClick={handleClosePopUpClick} />
					)}
				</ProfileUpdateProvider>
				<div className="intro_box">
					<img
						alt="Intro video"
						className="intro_video"
						src={require('../homepage_assets/pingpong.gif')}
					/>
				</div>
				<div>
					<h1 className="intro_header">Team Members</h1>
				</div>

				<div className="intro_div">
					{teamMembers1.map((member, index) => (
						<TeamMember
							key={index}
							name={member.name}
							role={member.role}
							linkedin={member.linkedin}
							github={member.github}
							imageSrc={member.imageSrc}
						/>
					))}
				</div>

				<div className="intro_div2">
					{teamMembers2.map((member, index) => (
						<TeamMember
							key={index}
							name={member.name}
							role={member.role}
							linkedin={member.linkedin}
							github={member.github}
							imageSrc={member.imageSrc}
						/>
					))}
				</div>
			</>
		</Container>
	);
};
