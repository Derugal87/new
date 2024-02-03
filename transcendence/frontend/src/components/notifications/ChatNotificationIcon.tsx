import React, { useEffect, useState } from 'react';
import chatIcon from '../../images/chatIcon.png';
import { useHookstate } from '@hookstate/core';
import { glbNotifcationCount } from '../../stores/chat/notificationCountStore';

export default function ChatNotificationIcon() {
	const [count, setCount] = useState(0);
	const globalNotifcationCount = useHookstate(glbNotifcationCount);

	useEffect(() => {
		if (globalNotifcationCount.get() > 0)
			document.title = `Transcendence (${globalNotifcationCount.get()})`;
		else document.title = `Transcendence`;
	}, [globalNotifcationCount]);

	return (
		<li className="header-nav-item">
			<div className="notification-badge">
				<img src={chatIcon} alt="chatIcon" className={`icon`} />
				{globalNotifcationCount.get() > 0 && (
					<span className="badge">{globalNotifcationCount.get()}</span>
				)}
			</div>
		</li>
	);
}
