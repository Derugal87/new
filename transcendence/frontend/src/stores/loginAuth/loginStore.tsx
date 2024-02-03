import { hookstate } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

const storedData = localStorage.getItem('loginStore');
const initialState = storedData ? JSON.parse(storedData) : false;

export const glbLoginStore = hookstate(
	initialState,
	localstored({
		key: 'loginStore',
	}),
);
