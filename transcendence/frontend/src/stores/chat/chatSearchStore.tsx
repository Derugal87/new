import { hookstate } from '@hookstate/core';
import { Channel, User } from '../../models/Chat/Chat.interface';

export const SearchStore = hookstate({
	isInputFocused: false,
	arrow: false,
});

type DataItem = User | Channel;
export const searchList = hookstate<DataItem[] | []>([]);
