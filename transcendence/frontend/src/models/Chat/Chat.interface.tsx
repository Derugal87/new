export interface User {
	id: number;
	nickname: string;
	avatar: string;
	message: [
		{
			text: string;
			time: string;
		},
	];
}

export interface Channel {
	id: number;
	name: string;
	avatar: string;
	message: [
		{
			text: string;
			time: string;
		},
	];
}

export interface ListChannel {
	channel: {
		id: number;
		name: string;
		avatar: string;
	};
}

export interface ChatTabsProps {
	onHandleTabClick: (index: string) => void;
	activeTab: string;
}

export type PropsCreateChan = {
	setCreateChannel: (createChan: boolean) => void;
};
