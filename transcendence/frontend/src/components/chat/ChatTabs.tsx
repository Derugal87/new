import { useHookstate } from '@hookstate/core';
import activeTab, { channelUserId } from '../../stores/chat/chatTabsStore';
import { useNavigate } from 'react-router-dom';

export default function ChatTabs() {
	const globalActiveTab = useHookstate(activeTab);
	const globalChannelUserId = useHookstate(channelUserId);
	const tabs: string[] = ['users', 'channels'];
	const navigate = useNavigate();

	const handleChangeTab = (index: number) => {
		globalActiveTab.set(tabs[index]);
		navigate(`/chat/${globalActiveTab.get()}`);
		globalChannelUserId.set(null);
	};
	return (
		<div className="tabs-chat">
			{tabs.map((tab, index) => (
				<div
					key={index}
					className={`tab-chat ${globalActiveTab.value === tabs[index] ? 'active' : ''}`}
					onClick={() => handleChangeTab(index)}
				>
					{tab}
				</div>
			))}
		</div>
	);
}
