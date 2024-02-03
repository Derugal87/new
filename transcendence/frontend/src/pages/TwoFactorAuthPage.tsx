import react from 'react';
import TwoFactorAuthForm from '../components/TwoFactorAuthForm';

const queryString = window.location.search;
const params = new URLSearchParams(queryString);

const TwoFactorAuthPage = () => {
	const handleFormSubmit = (otpCode: string) => {
		console.log('Submitting OTP code:', otpCode);
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				height: '100vh',
			}}
		>
			<h1>Two-Factor Authentication</h1>
			<TwoFactorAuthForm
				id={Number(params.get('id') || '')}
				nickname={'temporary_nickname'}
				baseUrl={'http://localhost:4000'}
			/>
		</div>
	);
};

export default TwoFactorAuthPage;
