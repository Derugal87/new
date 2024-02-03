import { ListChannel, User } from '../../models/Chat/Chat.interface';
import { hookstate, State } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

export const userLists = hookstate<User[] | []>([]);

export const channelLists = hookstate<any>([]);

const storedData = localStorage.getItem('userInfo');
const initialState = storedData ? JSON.parse(storedData) : false;
const userInfo = hookstate<any>(
	initialState,
	localstored({
		key: 'userInfo',
	}),
);

export default userInfo;
