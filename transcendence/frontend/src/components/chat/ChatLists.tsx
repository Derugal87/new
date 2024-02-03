import { useHookstate } from '@hookstate/core';
import { SearchStore } from '../../stores/chat/chatSearchStore';
import activeTab from '../../stores/chat/chatTabsStore';
import ChatListUser from './ChatListUser';
import ChatListChannel from './ChatListChannel';

export default function ChatLists() {
	const globalSearchStore = useHookstate(SearchStore);
	const globalActiveTab = useHookstate(activeTab);
	return !globalSearchStore.get().isInputFocused ? (
		<>
			{globalActiveTab.get() === 'users' && <ChatListUser />}
			{globalActiveTab.get() === 'channels' && <ChatListChannel />}
		</>
	) : null;
}
