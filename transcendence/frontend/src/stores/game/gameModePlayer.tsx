import { hookstate } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

const storedData = localStorage.getItem('gameModePlayer');
const initialState = storedData ? JSON.parse(storedData) : '';

export const gameModePlayer = hookstate(
	initialState,
	localstored({
		key: 'gameModePlayer',
	}),
);
