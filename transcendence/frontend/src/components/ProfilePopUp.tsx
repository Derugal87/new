import React, { useState, ChangeEvent, useEffect } from 'react';
import '../styles/ProfileEditPopUp.style.css';
import cancel from '../images/cancel.png';
import useFetch from '../customHooks/useFetch';
import { useProfileUpdateContext } from '../customContexts/ProfileUpdateContext';
import { useHookstate } from '@hookstate/core';
import { glbLoginStore } from '../stores/loginAuth/loginStore';
import { glbUserStore } from '../stores/user/userStore';

const isUsernameValid = (username: string): boolean => {
	if (username.length < 5 || username.length > 15) {
		return false;
	}

	const validUsernameRegex = /^[a-zA-Z0-9]+$/;
	return validUsernameRegex.test(username);
};

interface ProfilePopup {
	onClosePopUpClick: () => void;
	isHomePage: boolean;
}

function ProfilePopup(props: ProfilePopup) {
	const [name, setName] = useState<string>('');
	const [image, setImage] = useState<string | ArrayBuffer | null>('');
	const [imageStatus, setImageStatus] = useState('');
	const [isValid, setIsValid] = useState<boolean>(true);
	const [nameUnique, setNameUnique] = useState<boolean>(false);
	const { post, get, put } = useFetch('http://localhost:4000');
	const context = useProfileUpdateContext();
	const globalLoginStore = useHookstate(glbLoginStore);
	const globalUserStore = useHookstate(glbUserStore);

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (file) {
			try {
				// Validate file type
				const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
				if (!allowedTypes.includes(file.type)) {
					setImageStatus('Invalid file type, i will replace default image');
					return;
				}

				// Validate file size
				const maxSizeMB = 3; // Maximum size in megabytes
				if (file.size > maxSizeMB * 1024 * 1024) {
					setImageStatus('File size exceeds the limit, i will replace default image');
					return;
				} else {
					setImageStatus('');
				}

				const image = new Image();
				image.src = URL.createObjectURL(file);

				image.onload = () => {
					const canvas = document.createElement('canvas');
					const maxDimension = 800; // Adjust maximum dimension as needed
					const scaleFactor = Math.min(maxDimension / image.width, maxDimension / image.height);

					canvas.width = image.width * scaleFactor;
					canvas.height = image.height * scaleFactor;

					const context1 = canvas.getContext('2d');
					if (context1) {
						context1.drawImage(image, 0, 0, canvas.width, canvas.height);

						// Convert the compressed image to a Base64 string
						const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8); // Adjust compression quality as needed

						setImage(compressedBase64);
					} else {
						console.error('Error obtaining canvas context');
					}

					URL.revokeObjectURL(image.src);
				};
			} catch (error) {
				console.error('Error handling image:', error);
			}
		}
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
		const inputUsername = e.target.value;
		setName(inputUsername);
		setIsValid(isUsernameValid(inputUsername));
	};

	useEffect(() => {
		if (isValid) {
			get('/user')
				.then((data: any) => {
					const isNameUnique = data.filter((element: any) => {
						return element.nickname === name;
					});
					if (isNameUnique.length === 0) {
						setNameUnique(true);
					} else setNameUnique(false);
				})
				.catch((e) => console.error(e));
		}
	}, [name]);

	const handleSaveFormClick = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		let id_42: string | null = localStorage.getItem('id_42');
		const obj1 = {
			nickname: name,
			avatar: image?.toString() || '',
			id_42: id_42?.toString() || '',
		};

		put('/user/' + obj1.id_42, obj1)
			.then((data: any) => {
				globalUserStore.set(data);
				localStorage.setItem('user_id', data.id);
				context.setData(data);
				globalLoginStore.set(true);
			})
			.catch((e) => {
				console.error('cool:', e);
			});

		localStorage.setItem('isNew', 'false');
		props.onClosePopUpClick();
	};

	const isSaveButtonDisabled = !isValid || !nameUnique || !name;

	return (
		<form onSubmit={handleSaveFormClick} className="popup">
			<div className="popup-content">
				<h2 className="popup-content-title">Profile</h2>
				<div className="edit-image">
					<label htmlFor="image">Image:</label>
					<input
						id="image"
						type="file"
						name="image"
						accept="image/*"
						onChange={handleImageChange}
					/>
					<div style={{ color: 'red', padding: '5px' }}>{imageStatus}</div>
				</div>
				<div className="edit-name">
					<label htmlFor="name">Nickname: </label>
					<input
						autoFocus
						className="text-input"
						style={{ width: props.isHomePage ? '240px' : '300px' }}
						id="name"
						type="text"
						name="name"
						placeholder="Name"
						value={name}
						onChange={handleNameChange}
					/>
				</div>
				<div>
					{name?.length < 5 || name?.length > 15 ? (
						<span style={{ color: 'red' }}>
							Username length must be between 5 and 15 characters!
						</span>
					) : isValid === true ? (
						<span style={{ color: nameUnique ? 'green' : 'red' }}>
							Valid username! {nameUnique ? ' and unique 🥳🥳🥳' : 'but not unique 😢😢😢'}
						</span>
					) : (
						<span style={{ color: 'red' }}>Invalid username!</span>
					)}
				</div>
				<div className="buttons">
					<button
						type="submit"
						className={`save ${isSaveButtonDisabled ? 'disabled' : ''}`}
						disabled={isSaveButtonDisabled}
					>
						Save
					</button>
				</div>
			</div>
		</form>
	);
}

export default ProfilePopup;
