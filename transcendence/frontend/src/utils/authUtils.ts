// authUtils.ts
import useFetch from '../customHooks/useFetch'; // Update with the correct path

export interface ValidationResult {
	isValid: boolean;
	user?: any; // Define a more specific type for your user object if available
	error?: Error;
}

interface AuthData {
	statusCode?: number;
	message?: string;
	user?: any;
}

interface TwoFactorStatus {
	two_factor_auth_enabled: boolean;
}

export const useAuthUtils = (baseUrl: string) => {
	const { get } = useFetch(baseUrl);

	const isLoggedIn = async (): Promise<ValidationResult> => {
		try {
			const data = (await get('/auth/validate-token', false)) as AuthData;
			if (data.message == 'Token is valid' && data.statusCode === 200) {
				console.log('user is authenticated, data: ', data);
				console.log('token:' + localStorage.getItem('token'));
				return { isValid: true }; //user: data.user };
			} else {
				console.log('user is not authenticated, data: ', data);
				console.log('token:' + localStorage.getItem('token'));
				return { isValid: false };
			}
		} catch (error) {
			console.error('Error validating token:', error);
			return { isValid: false, error: error as Error };
		}
	};

	const get2FAStatus = async (): Promise<boolean> => {
		try {
			const data = (await get(`/auth/get-2fa-status`, false)) as TwoFactorStatus; // Assuming the userId is obtained from the JWT token and not needed in the URL
			console.log('2FA status:', data);
			return data.two_factor_auth_enabled;
		} catch (error) {
			console.error('Error fetching 2FA status:', error);
			throw error; // Or handle this error as you see fit
		}
	};

	return { isLoggedIn, get2FAStatus };
};
