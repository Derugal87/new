import { hookstate } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

const storedData = localStorage.getItem('user');
const initialState = storedData ? JSON.parse(storedData) : '';

export const glbUserStore = hookstate(
	initialState,
	localstored({
		key: 'user',
	}),
);
