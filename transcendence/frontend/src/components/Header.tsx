//issue: the badge counts are rendered temporarily, maybe need to store as cookies?

import React, { useState, useEffect, useRef } from 'react';
import '../styles/Header.style.css';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import '../styles/NavigationBadge.style.css';
import LogoutIcon from './utils/LogoutButton';
import { FriendRequestIcon } from './notifications/FriendRequestIcon';
import ChatNotificationIcon from './notifications/ChatNotificationIcon';
import { GameRequestIcon } from './notifications/GameRequestIcon';

type Props = {
	showNavList: boolean;
	listHeader: string[];
	setShowNavList: (arg: boolean) => void;
};

const HamburgerHeader = ({ showNavList, listHeader, setShowNavList }: Props) => {
	const location = useLocation();
	const navListRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleDocumentClick = (e: MouseEvent) => {
			if (navListRef.current && !navListRef.current.contains(e.target as Node)) {
				setShowNavList(false);
			}
		};

		document.body.addEventListener('click', handleDocumentClick);

		return () => {
			document.body.removeEventListener('click', handleDocumentClick);
		};
	}, []);

	return (
		<>
			<nav className="header-hamburger-nav" ref={navListRef}>
				<ul className={`header-nav-list ${showNavList ? 'active' : ''}`}>
					{listHeader.map((list, index) => (
						<li key={index}>
							<NavLink
								to={'/' + list}
								className={({ isActive }) =>
									isActive ? 'header-nav-link active' : 'header-nav-link'
								}
							>
								{list.toUpperCase()}
							</NavLink>
						</li>
					))}
					{/* <li className="header-nav-item">
					<NavLink
						to={'/profile'}
						className={
							location.pathname === '/profile' ? 'header-nav-link active' : 'header-nav-link'
						}
					>
						Profile
					</NavLink>
				</li> */}
				</ul>
			</nav>
			<nav className="header-hamburger-nav">
				<ul className="header-nav-list">
					<FriendRequestIcon />
					<GameRequestIcon />
					<ChatNotificationIcon />
					<LogoutIcon />
				</ul>
			</nav>
		</>
	);
};

const Header: React.FC = () => {
	const [showNavList, setShowNavList] = useState(false);

	const toggleNavList = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		setShowNavList((prevShowNavList) => !prevShowNavList);
	};

	const listHeader: string[] = ['home', 'chat', 'game', 'profile'];

	return (
		<header className="header-container">
			<nav className="header-nav">
				<img src={logo} alt="Logo" className="logo" />
				<ul className="header-nav-list">
					{listHeader.map((list, index) => {
						return (
							<li className="header-nav-item" key={index}>
								<NavLink
									to={'/' + list}
									className={({ isActive }) =>
										isActive ? 'header-nav-link active' : 'header-nav-link'
									}
								>
									{list.toUpperCase()}
								</NavLink>
							</li>
						);
					})}
				</ul>
			</nav>
			<nav className="header-nav">
				<ul className="header-nav-list">
					<FriendRequestIcon />
					<GameRequestIcon />
					<ChatNotificationIcon />
					<LogoutIcon />
				</ul>
			</nav>
			<div
				className={`toggle-button-hamburger ${showNavList ? 'active' : ''}`}
				onClick={toggleNavList}
			>
				<FontAwesomeIcon icon={faBars} />
			</div>
			{showNavList && (
				<HamburgerHeader
					showNavList={showNavList}
					setShowNavList={setShowNavList}
					listHeader={listHeader}
				/>
			)}
		</header>
	);
};

export default Header;
