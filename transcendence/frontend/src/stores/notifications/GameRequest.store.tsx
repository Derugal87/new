import { hookstate, State } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

const storedData = localStorage.getItem('game_req_data');
const initialState = storedData ? JSON.parse(storedData) : [];
export const game_req_data = hookstate<any>(
	initialState,
	localstored({
		key: 'game_req_data',
	}),
);
