import { hookstate } from '@hookstate/core';
import { localstored } from '@hookstate/localstored';

const storedData = localStorage.getItem('objInviting');
const initialState = storedData
	? JSON.parse(storedData)
	: {
			isInviting: false,
			inviteeId: null,
	  };

export const glbIsInviting = hookstate(
	initialState,
	localstored({
		key: 'objInviting', // Set your desired key for local storage
	}),
);
