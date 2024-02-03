import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import useFetch from '../customHooks/useFetch';

interface TwoFactorSetupProps {
	id: number;
	nickname: string;
	baseUrl: string;
}

interface User {
	nickname: string;
}

function TwoFactorSetup2({ id, nickname, baseUrl }: TwoFactorSetupProps) {
	const { get, post } = useFetch(baseUrl);
	const [qrUrl, setQrUrl] = useState<string>('');
	const [secretKey, setSecretKey] = useState<string>('');
	const [otpCode, setOtpCode] = useState<string>('');
	const [message, setMessage] = useState<string>('');

	get(`/user/${id}`)
		.then((data) => {
			const userData = data as User;
			console.log('User data:');
			console.log(data);
			nickname = userData.nickname;
		})
		.catch((e) => {
			console.error(e);
		});

	const disable2FA = () => {
		post('/auth/disable-2fa', { id, nickname })
			.then((data: any) => {
				setMessage(data.message);
			})
			.catch((error: Error) => console.error('Error disabling 2FA', error));
	};

	return (
		<div style={{ textAlign: 'center' }}>
			<h2>DISABLE 2FA</h2>
			<button onClick={disable2FA} style={{ color: 'white', backgroundColor: 'red' }}>
				Disable 2FA
			</button>
			{message && <p>{message}</p>}
		</div>
	);
}

export default TwoFactorSetup2;
