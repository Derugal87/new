import { hookstate, State } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

export const friend_req_socket = hookstate<any>(null);

const storedData = localStorage.getItem('friend_req_data');
const initialState = storedData ? JSON.parse(storedData) : [];
export const friend_req_data = hookstate<any>(
	initialState,
	localstored({
		key: 'friend_req_data',
	}),
);
