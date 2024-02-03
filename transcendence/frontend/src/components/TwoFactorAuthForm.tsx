import React, { useState, useEffect } from 'react';
import useFetch from '../customHooks/useFetch';
import { useNavigate } from 'react-router-dom';

interface TwoFactorProps {
	id: number;
	nickname: string;
	baseUrl: string;
}

interface User {
	nickname: string;
	id_42: string;
}

function TwoFactorAuthForm({ id, nickname, baseUrl }: TwoFactorProps) {
	const { get, post } = useFetch(baseUrl);
	const [otpCode, setOtpCode] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [id_42, setId_42] = useState<string>('');
	const [token, setToken] = useState<string>('');
	const [refreshToken, setRefreshToken] = useState<string>('');
	const navigate = useNavigate();

	get(`/user/${id}`)
		.then((data) => {
			const userData = data as User;
			console.log('User data:');
			console.log(data);
			nickname = userData.nickname;
			setId_42(userData.id_42);
		})
		.catch((e) => {
			console.error(e);
		});

	const verify2FA = () => {
		post('/auth/verify-2fa', { userId: id, otpCode })
			.then((data: any) => {
				setMessage(data.message);
				if (data.message === 'OTP code is valid') {
					setToken(data.token.access_token || '');
					setRefreshToken(data.refresh_token || '');
					console.log('Refresh token: ', data.refresh_token);
					console.log('data: ', data);
				}

				// if (data.message == 'OTP code is valid') {
				//   localStorage.setItem('token', data.token.access_token);
				//   localStorage.setItem('nickname', nickname);
				//   redirect('/home?token=' + data.token.access_token + '&id_42=' + id_42 + '&isNew=false' + '&id=' + id);
				// }
				// else {
				//   console.log("Error verifying 2FA");
				// }
			})
			.catch((error: Error) => {
				console.error('Error verifying 2FA', error);
				setMessage(error.message || 'Error verifying 2FA');
			});
	};

	useEffect(() => {
		if (message === 'OTP code is valid') {
			localStorage.setItem('token', token);
			localStorage.setItem('nickname', nickname);
			localStorage.setItem('refreshToken', refreshToken);
			navigate(
				`/home?token=${token}&id_42=${id_42}&isNew=false&id=${id}&refreshToken=${refreshToken}`,
			);
		}
	}, [message]);

	return (
		<div>
			<input
				type="text"
				placeholder="Enter OTP code"
				value={otpCode}
				onChange={(e) => setOtpCode(e.target.value)}
			/>
			<button onClick={verify2FA}>Verify 2FA</button>
			{message && <p>{message}</p>}
		</div>
	);
}

export default TwoFactorAuthForm;
