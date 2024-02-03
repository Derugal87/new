import React, { createContext, useContext, useState } from 'react';

interface ProfileUpdateContextType {
	setData: React.Dispatch<React.SetStateAction<any | null>>;
	data: any | null;
}

const ProfileUpdateContext = createContext<ProfileUpdateContextType | undefined>(undefined);

const ProfileUpdateProvider: React.FC<{ children: React.ReactNode }> = (props) => {
	const [data, setData] = useState<any | null>(null);

	const value: ProfileUpdateContextType = {
		setData: setData,
		data: data,
	};

	return (
		<ProfileUpdateContext.Provider value={value}>{props.children}</ProfileUpdateContext.Provider>
	);
};

function useProfileUpdateContext(): ProfileUpdateContextType {
	const context = useContext(ProfileUpdateContext);
	if (context === undefined) {
		throw new Error('useProfileUpdateContext must be used within a ProfileUpdateProvider');
	}
	return context;
}

export { ProfileUpdateProvider, useProfileUpdateContext };
