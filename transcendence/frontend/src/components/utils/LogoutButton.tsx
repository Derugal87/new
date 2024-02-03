import '../../styles/Header.style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';
import { useEffect } from 'react';

const LogoutButton = () => {
	const handleClear = () => {
		localStorage.clear();
	};
	return <FontAwesomeIcon icon={faSignOutAlt} className="logout-btn" onClick={handleClear} />;
};

const LogoutIcon = () => {
	return (
		<li className="header-nav-item">
			<NavLink to={'/'}>
				<LogoutButton />
			</NavLink>
		</li>
	);
};

export default LogoutIcon;
