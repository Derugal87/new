//
import { useEffect, useState } from 'react';
import Container from '../Container';
import Header from '../Header';
import '../../styles/GamePageSetUp.style.css';
import '../../styles/MainGame.style.css';
import { useHookstate } from '@hookstate/core';
import { gameState } from '../../stores/game/gameStore';
import { useNavigate } from 'react-router-dom';

import backgroundImage1 from '../../img/spaceWar.jpg';
import backgroundImage2 from '../../img/darkClouds.jpg';
import backgroundImage3 from '../../img/wood.jpg';
import backgroundImage4 from '../../img/Fantasia.jpg';
import backgroundImage5 from '../../img/blueBlur.jpg';
import backgroundImage6 from '../../img/pinkBlur.jpg';
import backgroundImage7 from '../../img/nightFestival.jpg';
import backgroundImage8 from '../../img/orangeBlur.jpg';
import backgroundImage9 from '../../img/Twistedblack.jpg';
import backgroundImage10 from '../../img/Twistedred.jpg';
import backgroundImage11 from '../../img/HiTechM173.jpg';
import backgroundImage12 from '../../img/HiTechM174.jpg';
import useFetch from '../../customHooks/useFetch';
import MainGame from './MainGame';
import { gameModePlayer } from '../../stores/game/gameModePlayer';
import { useGameSocket } from '../../customContexts/gameSocketContext';
import { glbIsInviting } from '../../stores/game/isInvitingStore';

const backgroundImages = [
	{ path: backgroundImage1, name: 'Space War' },
	{ path: backgroundImage2, name: 'Dark Clouds' },
	{ path: backgroundImage3, name: 'Woods' },
	{ path: backgroundImage4, name: 'Fantasia' },
	{ path: backgroundImage5, name: 'Blue Blur' },
	{ path: backgroundImage6, name: 'Pink Blur' },
	{ path: backgroundImage7, name: 'Night Festival' },
	{ path: backgroundImage8, name: 'Orange Blur' },
	{ path: backgroundImage9, name: 'Twisted Black' },
	{ path: backgroundImage10, name: 'Twisted Red' },
	{ path: backgroundImage11, name: 'Hi Tech M173' },
	{ path: backgroundImage12, name: 'Hi Tech M174' },
];
export default function GamePageSetUp() {
	const globalGameState = useHookstate(gameState);
	const [isOpen, setIsOpen] = useState(false);

	const [canvas, setCanvas] = useState<any>();
	const [context, setContext] = useState<any>();
	const navigate = useNavigate();
	const socket = useGameSocket();
	const currentUserId = localStorage.getItem('user_id');
	const globalIsInviting = useHookstate(glbIsInviting);
	console.log('globalIsInviting:', globalIsInviting.get());
	useEffect(() => {
		// globalGameState.backgroundImage.set(backgroundImage1);
		globalGameState.background.set('#000000');
		globalGameState.strokeColor.set('#ffffff');
		globalGameState.speedX.set(4);
		globalGameState.speedY.set(4);
		globalGameState.ballColor.set('#ffffff');
		globalGameState.ballRadius.set(5);
		globalGameState.paddleHeight.set(5);
		globalGameState.paddleWidth.set(50);
		globalGameState.paddleColor.set('#ffffff');
		globalGameState.scoreLimit.set(5);
		globalGameState.score.set({ creator: 0, joiner: 0 });
		globalGameState.speedX.set(2);
		globalGameState.speedY.set(2);
	}, []);

	useEffect(() => {
		const canvas1 = document.getElementById('canvas-settings') as HTMLCanvasElement;
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
				renderPaddle();
				renderCenterLine();
				renderBall();
			};
			img.src = backgroundImageEntry.path;
			img.onerror = (error) => {
				console.error('Image loading error:', error);
			};
		} else {
			context.fillStyle = globalGameState.background.get();
			context.fillRect(0, 0, globalGameState.width.get(), globalGameState.height.get());
			renderPaddle();
			renderCenterLine();
			renderBall();
		}
	};

	function renderCenterLine() {
		context.beginPath();
		context.setLineDash([12]);
		context.moveTo(350, 0);
		context.lineTo(350, 500);
		context.strokeStyle = globalGameState.strokeColor.get();
		context.stroke();
	}

	function renderPaddle() {
		context.fillStyle = globalGameState.paddleColor.get();

		context.fillRect(
			10,
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
	console.log('globalIsInviting:', globalIsInviting.get().isInviting);
	const handleStartGame = () => {
		if (globalIsInviting.get().isInviting) {
			socket?.emit('sendGameInvitation', {
				inviterId: currentUserId,
				inviteeId: globalIsInviting.get().inviteeId.toString(),
				settings: globalGameState.get(),
			});
		}
		navigate('/game/start');
	};

	return (
		<Container>
			<>
				<Header />
				{!isOpen && (
					<div>
						<h1 className="gameSettings">Game Settings</h1>
						<div className="appContainer1">
							<div className="app-settings">
								<label>
									Ball Speed:
									<input
										className="input-style"
										type="number"
										value={globalGameState.speedX.get()}
										onChange={(e) => {
											const value = e.target.value;
											if (Number(value) >= 1 && Number(value) <= 8) {
												globalGameState.speedX.set(Number(value));
												globalGameState.speedY.set(Number(value));
											}
										}}
										min={1}
										max={8}
									/>
								</label>
								<br />
								<label>
									Background Image:
									<select
										className="input-style"
										value={globalGameState.backgroundImage.get()}
										onChange={(e) => globalGameState.backgroundImage.set(e.target.value)}
									>
										<option value="">Select an image</option>
										{backgroundImages.map((img) => (
											<option key={img.path} value={img.path}>
												{img.name}
											</option>
										))}
									</select>
								</label>
								<br />
								<label>
									Background Color:
									<input
										className="input-style"
										type="color"
										value={globalGameState.background.get()}
										onChange={(e) => globalGameState.background.set(e.target.value)}
									/>
								</label>
								<br />
								<label>
									Ball Color:
									<input
										className="input-style"
										type="color"
										value={globalGameState.ballColor.get()}
										onChange={(e) => globalGameState.ballColor.set(e.target.value)}
									/>
								</label>
								<br />
								<label>
									Ball radius:
									<input
										className="input-style"
										type="number"
										value={globalGameState.ballRadius.get()}
										onChange={(e) => {
											const value = Number(e.target.value);

											if (!isNaN(value) && value >= 5 && value <= 60) {
												globalGameState.ballRadius.set(value);
											}
										}}
										min={5}
										max={60}
									/>
								</label>
								<br />
								<label>
									Paddle Height:
									<input
										className="input-style"
										type="number"
										value={globalGameState.paddleHeight.get()}
										onChange={(e) => {
											const value = Number(e.target.value);

											if (!isNaN(value) && value >= 5 && value <= 20) {
												globalGameState.paddleHeight.set(value);
											}
										}}
										min={5}
										max={20}
									/>
								</label>
								<br />
								<label>
									Paddle Width:
									<input
										className="input-style"
										type="number"
										value={globalGameState.paddleWidth.get()}
										onChange={(e) => {
											const value = Number(e.target.value);

											if (!isNaN(value) && value >= 30 && value <= 200) {
												globalGameState.paddleWidth.set(value);
											}
										}}
										min={30}
										max={200}
									/>
								</label>
								<br />
								<label>
									Paddle Color:
									<input
										className="input-style"
										type="color"
										value={globalGameState.paddleColor.get()}
										onChange={(e) => globalGameState.paddleColor.set(e.target.value)}
									/>
								</label>
								<br />
								<label>
									Center line Color:
									<input
										className="input-style"
										type="color"
										value={globalGameState.strokeColor.get()}
										onChange={(e) => globalGameState.strokeColor.set(e.target.value)}
									/>
								</label>
								<br />
								<label>
									Score Limit:
									<input
										className="input-style"
										type="number"
										value={globalGameState.scoreLimit.get()}
										onChange={(e) => {
											const value = Number(e.target.value);

											if (!isNaN(value) && value >= 5 && value <= 20) {
												globalGameState.scoreLimit.set(value);
											}
										}}
										min={5}
										max={20}
									/>
								</label>
							</div>
							<canvas
								id="canvas-settings"
								width={globalGameState.width.get()}
								height={globalGameState.height.get()}
							></canvas>
						</div>
						<br />
						<div className="game-buttons">
							<button type="submit" className="game-button" onClick={handleStartGame}>
								CONTINUE
							</button>
						</div>
					</div>
				)}
			</>
		</Container>
	);
}
