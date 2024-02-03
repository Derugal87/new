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

function TwoFactorSetup({ id, nickname, baseUrl }: TwoFactorSetupProps) {
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

	// const enable2FA = () => {
	// 	post('/auth/enable-2fa', { id, nickname })
	// 		.then((data: any) => {
	// 			setQrUrl(data.two_factor_auth_url);
	// 			setSecretKey(data.two_factor_auth_key);
	// 		})
	// 		.catch((error: Error) => console.error('Error enabling 2FA', error));
	// };

	const enable2FA = () => {
		post('/auth/enable-2fa', { id, nickname })
			.then((data: any) => {
				setQrUrl(data.two_factor_auth_url);
				setSecretKey(data.two_factor_auth_key);
				setMessage('2FA enabled successfully');
			})
			.catch((error: Error) => console.error('Error enabling 2FA', error));
	};

	return (
		<div style={{ textAlign: 'center' }}>
			<h2>ENABLE 2FA</h2>
			<p>Scan generated QR code with your authenticator app</p>
			{qrUrl && <QRCode value={qrUrl} />}
			<button onClick={enable2FA} style={{ color: 'white', backgroundColor: 'red' }}>
				Generate new QR code
			</button>
			{message && <p>{message}</p>}
		</div>
	);
}

export default TwoFactorSetup;
