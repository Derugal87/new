import '../styles/LoginPage.style.css';
import mainBackground from '../images/pong.jpeg';
import { useHookstate } from '@hookstate/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import backgroundImage1 from '../img/2img.jpeg';
import backgroundImage2 from '../img/3img.jpeg';
import backgroundImage3 from '../img/4img.jpeg';
import backgroundImage4 from '../img/6img.jpeg';
import backgroundImage5 from '../img/7img.jpeg';
import backgroundImage6 from '../img/game6.jpeg';
import backgroundImage7 from '../img/game7.jpeg';
import backgroundImage8 from '../img/game8.jpeg';
import backgroundImage9 from '../img/game9.jpeg';
import backgroundImage10 from '../img/game10.jpeg';
import backgroundImage11 from '../img/game11.jpeg';
import backgroundImage12 from '../img/game12.jpeg';
import { gameStateLogin } from '../stores/game/gameStoreLogin';
import { useAuthUtils } from '../utils/authUtils';

const backgroundImages = [
	{
		path: backgroundImage1,
		name: 'Image 1',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage2,
		name: 'Image 2',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#c24a56',
	},
	{
		path: backgroundImage3,
		name: 'Image 3',
		introColor: '#FF0000',
		paddleColor: '#FF0000',
		ballColor: '#FF0000',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage4,
		name: 'Image 4',
		introColor: '#ffffff',
		paddleColor: '#000000',
		ballColor: '#ffffff',
		centerLine: '#000000',
	},
	{
		path: backgroundImage5,
		name: 'Image 5',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage6,
		name: 'Image 6',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage7,
		name: 'Image 7',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage8,
		name: 'Image 8',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage9,
		name: 'Image 9',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage10,
		name: 'Image 10',
		introColor: '#b1e3e0',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage11,
		name: 'Image 11',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
	{
		path: backgroundImage12,
		name: 'Image 12',
		introColor: '#ffffff',
		paddleColor: '#ffffff',
		ballColor: '#ffffff',
		centerLine: '#ffffff',
	},
];

export default function LoginPage() {
	const url = process.env.REACT_APP_API_URL;
	// const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading, true = authenticated, false = not authenticated
	const navigate = useNavigate();
	const { isLoggedIn } = useAuthUtils('http://localhost:4000');

	useEffect(() => {
		const checkLogin = async () => {
			try {
				const result = await isLoggedIn();
				if (result.isValid) {
					navigate('/home'); // Redirect to the home page if logged in
				}
			} catch (error) {
				console.error('Error checking login', error);
			}
		};
		checkLogin();
	}, [isLoggedIn, navigate]); // Add dependencies here

	const globalGameState = useHookstate(gameStateLogin);

	const [canvas, setCanvas] = useState<any>();
	const [context, setContext] = useState<any>();

	useEffect(() => {
		const intervalId = setInterval(() => {
			// const currentTime = new Date();
			// console.log(`Current time: ${currentTime.toLocaleTimeString()}`);
			const randomIndex = Math.floor(Math.random() * 12); // Generates a random number between 0 and 11
			globalGameState.backgroundImage.set(backgroundImages[randomIndex].path);
			console.log(`Random index: ${randomIndex} ${globalGameState.backgroundImage.get()}`);
			globalGameState.introColor.set(backgroundImages[randomIndex].introColor);
			globalGameState.paddleColor.set(backgroundImages[randomIndex].paddleColor);
			globalGameState.ballColor.set(backgroundImages[randomIndex].ballColor);
			globalGameState.strokeColor.set(backgroundImages[randomIndex].centerLine);
		}, 5000);

		// Cleanup the interval on component unmount
		return () => clearInterval(intervalId);
	}, []); // Empty dependency array ensures the effect runs only once on mount

	useEffect(() => {
		const canvas1 = document.getElementById('canvas') as HTMLCanvasElement;
		const context1 = canvas1.getContext('2d');
		setCanvas(canvas1);
		setContext(context1);
	}, []);

	useEffect(() => {
		function loadGame() {
			if (canvas) {
				renderCanvas();
			}
		}
		loadGame();
	}, [globalGameState.get()]);

	const renderCanvas = () => {
		if (!context || !canvas) {
			return;
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		const backgroundImageEntry = backgroundImages.find(
			(img) => img.path === globalGameState.backgroundImage.get(),
		);
		if (backgroundImageEntry) {
			const img = new Image();
			img.onload = () => {
				context.drawImage(img, 0, 0, globalGameState.width.get(), globalGameState.height.get());
				renderLeftPaddle();
				renderRightPaddle();
				renderCenterLine();
				renderBall();
				renderIntro(context);
			};
			img.src = backgroundImageEntry.path;
			img.onerror = (error) => {
				console.error('Image loading error:', error);
			};
		} else {
			context.fillStyle = globalGameState.background.get();
			context.fillRect(0, 0, globalGameState.width.get(), globalGameState.height.get());
			renderLeftPaddle();
			renderRightPaddle();
			renderCenterLine();
			renderBall();
			renderIntro(context);
		}
	};

	function renderCenterLine() {
		context.beginPath();
		context.setLineDash([10]);
		context.moveTo(700, 0);
		context.lineTo(700, 1000);
		context.strokeStyle = globalGameState.strokeColor.get();
		context.stroke();
	}

	function renderLeftPaddle() {
		context.fillStyle = globalGameState.paddleColor.get();

		context.fillRect(
			10,
			globalGameState.height.get() / 2 - globalGameState.paddleWidth.get() / 2,
			globalGameState.paddleHeight.get(),
			globalGameState.paddleWidth.get(),
		);
	}

	function renderRightPaddle() {
		context.fillStyle = globalGameState.paddleColor.get();

		context.fillRect(
			globalGameState.width.get() - globalGameState.paddleHeight.get() - 10,
			globalGameState.height.get() / 2 - globalGameState.paddleWidth.get() / 2,
			globalGameState.paddleHeight.get(),
			globalGameState.paddleWidth.get(),
		);
	}

	function renderBall() {
		context.beginPath();
		context.arc(
			globalGameState.get().ballX,
			globalGameState.get().ballY,
			globalGameState.ballRadius.get(),
			0,
			Math.PI * 2,
		);
		context.fillStyle = globalGameState.ballColor.get();
		context.fill();
	}

	function renderIntro(context: CanvasRenderingContext2D) {
		if (!context) return;

		context.fillStyle = globalGameState.introColor.get();
		context.font = '46px Courier New';
		context.fillText('WELCOME PONG GAME.', 490, globalGameState.height.get() / 4);
	}

	return (
		<div className="container">
			<div className="main">
				{/* <img src={mainBackground} alt="background" /> */}
				<canvas
					id="canvas"
					width={globalGameState.width.get()}
					height={globalGameState.height.get()}
					className="login-canvas"
				></canvas>
			</div>
			<div className="link-redirect">
				<a href={url}>Login from 42</a>
			</div>
		</div>
	);
}
