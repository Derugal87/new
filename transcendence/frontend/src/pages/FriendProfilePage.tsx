import { useNavigate } from 'react-router-dom';
import Container from '../components/Container';
import FriendInfo from '../components/friend/FriendInfo';
import Header from '../components/Header';
import { glbLoginStore } from '../stores/loginAuth/loginStore';
import { useEffect } from 'react';
import { useHookstate } from '@hookstate/core';
import { HorizontalLine } from './ProfilePage';
import FriendMatchHistory from '../components/friend/FriendMatchHistory';
import '../styles/MatchHistory.style.css';

export default function FrinedProfilePage() {
	const navigate = useNavigate();
	const globalLoginStore = useHookstate(glbLoginStore);

	useEffect(() => {
		if (!globalLoginStore.get()) navigate('/');
	}, []);

	return (
		<Container>
			<>
				<Header />
				<FriendInfo />
				<HorizontalLine />
				<FriendMatchHistory />
			</>
		</Container>
	);
}
