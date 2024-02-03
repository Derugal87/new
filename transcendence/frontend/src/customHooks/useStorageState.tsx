import React from 'react';
const useStorageState = (
	key: string,
	initialState: string,
): [string, (newValue: string) => void] => {
	const [value, setValue] = React.useState(localStorage.getItem(key) || initialState);

	React.useEffect(() => {
		localStorage.setItem(key, value);
	}, [value, key]);

	return [value, setValue];
};

export default useStorageState;
