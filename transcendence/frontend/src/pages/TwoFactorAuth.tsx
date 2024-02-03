import React, { useState, useEffect } from 'react';
// import QRCode from 'qrcode';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import '../styles/TwoFactorAuth.style.css';
// // Define the FormValues type explicitly
// type FormValues = {
// 	token: string;
// };

// type TwoFactorAuthProps = {
// 	otpauth_url: string;
// 	base32: string;
// 	closeModal: () => void;
// };

// const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ otpauth_url, base32, closeModal }) => {
// 	const [qrcodeUrl, setQrCodeUrl] = useState<string>('');

// 	const {
// 		handleSubmit,
// 		register,
// 		formState: { errors },
// 		setFocus,
// 	} = useForm<FormValues>(); // Use FormValues type here

// 	useEffect(() => {
// 		QRCode.toDataURL(otpauth_url)
// 			.then((dataUrl: string) => {
// 				setQrCodeUrl(dataUrl);
// 			})
// 			.catch((error: Error) => {
// 				console.error('Error generating QR code:', error);
// 			});
// 	}, [otpauth_url]);

// 	useEffect(() => {
// 		setFocus('token');
// 	}, [setFocus]);

// 	const onSubmitHandler: SubmitHandler<FormValues> = (data: any) => {
// 		// Handle form submission here
// 		console.log('Form submitted with token:', data.token);
// 	};

// 	return (
// 		<div className="overlay">
// 			<div className="modal">
// 				<h3 className="heading3">Two-Factor Authentication (2FA)</h3>
// 				<div className="modal-body">
// 					<h4 className="heading4">Configuring Google Authenticator or Authy</h4>
// 					<ul className="ordered-list">
// 						<li>Install Google Authenticator (IOS - Android) or Authy (IOS - Android).</li>
// 						<li>In the authenticator app, select "+" icon.</li>
// 						<li>
// 							Select "Scan a barcode (or QR code)" and use the phone's camera to scan this barcode.
// 						</li>
// 					</ul>
// 					<div>
// 						<h4 className="heading4">Scan QR Code</h4>
// 						<div className="qr-code">
// 							<img className="qr-image" src={qrcodeUrl} alt="qrcode url" />
// 						</div>
// 					</div>
// 					<div>
// 						<h4 className="heading4">Or Enter Code Into Your App</h4>
// 						<p className="text-sm">SecretKey: {base32} (Base32 encoded)</p>
// 					</div>
// 					<div>
// 						<h4 className="heading4">Verify Code</h4>
// 						<p className="text-sm">
// 							For changing the setting, please verify the authentication code:
// 						</p>
// 					</div>
// 					<form onSubmit={handleSubmit(onSubmitHandler)}>
// 						<input
// 							{...register('token')}
// 							className="input-field"
// 							placeholder="Authentication Code"
// 						/>
// 						<p className="error-message">
// 							{errors.token
// 								? typeof errors.token.message === 'string'
// 									? errors.token.message
// 									: null
// 								: null}
// 						</p>
// 						<div className="button-group">
// 							<button type="button" onClick={closeModal} className="button-grey">
// 								Close
// 							</button>
// 							<button type="submit" className="button-blue">
// 								Verify & Activate
// 							</button>
// 						</div>
// 					</form>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

const TwoFactorAuth: React.FC = () => {
	return <div></div>;
};

export default TwoFactorAuth;
