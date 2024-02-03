import React, { useEffect, useState, useRef } from 'react';
import { useHookstate } from '@hookstate/core';
import { gameState } from '../../stores/game/gameStore';
import { io } from 'socket.io-client';
import { gameModePlayer } from '../../stores/game/gameModePlayer';
import { render } from 'react-dom';
import { glbIsInviting } from '../../stores/game/isInvitingStore';
import { useGameSocket } from '../../customContexts/gameSocketContext';
import useFetch from '../../customHooks/useFetch';

// Constants

const PongGame = () => {
	const { get } = useFetch('http://localhost:4000');
	const globalGameState = useHookstate(gameState);
	const glbGameModePlayer = useHookstate(gameModePlayer);
	// const [image, setImg] = useState<any>();
	const imageRef = useRef<any>();
	let currentUserId: any = localStorage.getItem('user_id');
	const globalIsInviting = useHookstate(glbIsInviting);

	const animationFrameId = useRef<number | null>(null);

	// State to track if the game is over
	const [isGameOver, setIsGameOver] = useState(false);
	const socket = useGameSocket();

	useEffect(() => {
		globalIsInviting.set({
			isInviting: false,
			inviteeId: null,
		});
	}, []);
	useEffect(() => {
		const { context } = getCanvasAndContext();
		socket?.on('invitationRejected', (data: any) => {
			globalIsInviting.set({
				isInviting: false,
				inviteeId: null,
			});
			console.log('Rejected:', data);
			//you will be redirected to the game settings page
			if (context) renderIntro(context, 'Your invitation has been rejected');
			setTimeout(() => {
				window.location.href = '/game/settings';
			}, 2000);
		});
	}, [socket]);

	const img = new Image(); // 1) Create new Image object
	function loadImage() {
		img.onload = () => {
			// The image is loaded and can be used
			imageRef.current = img;
		};
		img.onerror = (error) => {
			console.error('Image loading error:', error);
			// // set default background color
			// globalGameState.background.set('#000000');
			// globalGameState.strokeColor.set('#ffffff');
			// // set default image
			// globalGameState.backgroundImage.set('null');
		};
		img.src = globalGameState.backgroundImage.get();
		console.log('img.src:', img.src);
		console.log('globalGameState.backgroundImage.get():', globalGameState.backgroundImage.get());
		console.log('img:', img);
	}

	const getCanvasAndContext = () => {
		const canvas = document.getElementById('canvas-game') as HTMLCanvasElement;
		const context = canvas?.getContext('2d');
		return { canvas, context };
	};

	// function setGameSettings(settings: any) {
	// 	globalGameState.width.set(settings.width);
	// 	globalGameState.height.set(settings.height);
	// 	globalGameState.paddleHeight.set(settings.paddleHeight);
	// 	globalGameState.paddleWidth.set(settings.paddleWidth);
	// 	globalGameState.paddleColor.set(settings.paddleColor);
	// 	globalGameState.ballRadius.set(settings.ballRadius);
	// 	globalGameState.ballColor.set(settings.ballColor);
	// 	globalGameState.background.set(settings.background);
	// 	globalGameState.strokeColor.set(settings.strokeColor);
	// 	globalGameState.speedX.set(settings.speedX);
	// 	globalGameState.speedY.set(settings.speedY);
	// 	globalGameState.scoreLimit.set(settings.scoreLimit);
	// 	globalGameState.backgroundImage.set(settings.backgroundImage);
	// 	globalGameState.scoreLimit.set(settings.scoreLimit);
	// }

	// create new setGameSettings that checks if the settings are null
	function setGameSettings(settings: any) {
		if (settings.width) globalGameState.width.set(settings.width);
		if (settings.height) globalGameState.height.set(settings.height);
		if (settings.paddleHeight) globalGameState.paddleHeight.set(settings.paddleHeight);
		if (settings.paddleWidth) globalGameState.paddleWidth.set(settings.paddleWidth);
		if (settings.paddleColor) globalGameState.paddleColor.set(settings.paddleColor);
		if (settings.ballRadius) globalGameState.ballRadius.set(settings.ballRadius);
		if (settings.ballColor) globalGameState.ballColor.set(settings.ballColor);
		if (settings.background) globalGameState.background.set(settings.background);
		if (settings.strokeColor) globalGameState.strokeColor.set(settings.strokeColor);
		if (settings.speedX) globalGameState.speedX.set(settings.speedX);
		if (settings.speedY) globalGameState.speedY.set(settings.speedY);
		if (settings.scoreLimit) globalGameState.scoreLimit.set(settings.scoreLimit);
		if (settings.backgroundImage) globalGameState.backgroundImage.set(settings.backgroundImage);
		if (settings.scoreLimit) globalGameState.scoreLimit.set(settings.scoreLimit);
	}

	useEffect(() => {
		const { context } = getCanvasAndContext();
		function loadGame() {
			if (context) {
				renderCanvas(context);
				renderIntro(context, 'Waiting for opponent...');
				// log socket
				console.log('socket:', socket);
				// if user is in game, don't emit ready
				if (!globalGameState.onGame.get()) {
					socket?.emit('ready', {
						userId: currentUserId,
						settings: glbGameModePlayer.get() === 'creator' ? globalGameState.get() : null,
					});
				}
				console.log('globalIsInviting:', globalIsInviting.get());
			}
		}

		loadImage(); // 2) Start loading the image
		loadGame(); // 3) Start loading the game

		return () => {
			if (animationFrameId.current !== null) {
				window.cancelAnimationFrame(animationFrameId.current);
			}
		};
	}, [socket]);

	const handleResumeGame = (inviterId: any, inviteeId: any, settings: any, gameState: any) => {
		console.log('handleResumeGame() triggered');
		renderUserNickname(inviterId, inviteeId);
		const savedGameState = localStorage.getItem('pongGameState');
		if (savedGameState) {
			const localGameSettings = JSON.parse(savedGameState);
			setGameSettings(localGameSettings);
			setGameSettings(settings);
		}
		// Set the game state
		globalGameState.set((state) => {
			state.ballX = gameState.ballX;
			state.ballY = gameState.ballY;
			state.paddleY[0] = gameState.paddleY[0];
			state.paddleY[1] = gameState.paddleY[1];
			state.score.creator = gameState.score.creator;
			state.score.joiner = gameState.score.joiner;
			return state;
		});
		let tmp = currentUserId === inviteeId;
		globalGameState.isReferee.set(tmp); // 4) Set the referee
		globalGameState.onGame.set(true); // 5) Set the game state

		loadImage(); // 6) Load the image again
		startGame();
	};

	const renderUserNickname = (inviterId: any, inviteeId: any) => {
		get(`/user/${inviterId}`).then((data: any) => {
			globalGameState.creatorNickname.set(data.nickname);
		});
		get(`/user/${inviteeId}`).then((data: any) => {
			globalGameState.joinerNickname.set(data.nickname);
		});
	};

	useEffect(() => {
		const handleStartGame = (inviterId: any, inviteeId: any, settings: any, gameState: any) => {
			// Set the game settings
			console.log('inviterId:', inviterId);
			console.log('inviteeId:', inviteeId);
			renderUserNickname(inviterId, inviteeId);
			setGameSettings(settings);
			console.log('inviterId:', inviterId);
			console.log('inviteeId:', inviteeId);
			// set game state
			globalGameState.set((state) => {
				state.ballX = gameState.ballX;
				state.ballY = gameState.ballY;
				state.paddleY[0] = gameState.paddleY[0];
				state.paddleY[1] = gameState.paddleY[1];
				state.score.creator = gameState.score.creator;
				state.score.joiner = gameState.score.joiner;
				return state;
			});
			let tmp = currentUserId === inviteeId;
			globalGameState.isReferee.set(tmp); // 4) Set the referee
			globalGameState.onGame.set(true); // 5) Set the game state

			loadImage(); // 6) Load the image again
			const { context } = getCanvasAndContext();

			let countdown = 3;
			const countdownInterval = setInterval(() => {
				// 7) Start the countdown
				if (countdown > 0) {
					console.log('Countdown:', countdown);
					if (context) {
						renderCountDown(context, countdown, img);
					}
					countdown--;
				} else {
					clearInterval(countdownInterval);
					console.log('Game started!');
					startGame();
				}
			}, 1000); // Countdown every 1 second
		};

		const handleGameOver = (data: any) => {
			setIsGameOver(true);
			// remove local game
			localStorage.removeItem('pongGameState');
			// Stop the game animation loop
			const winner = data.winner === currentUserId ? 'You' : 'Opponent';
			globalGameState.winner.set(winner);
			globalGameState.onGame.set(false);
			// gameModePlayer.set('null');
			const { context } = getCanvasAndContext();
			renderGameOverScreen(context, data);
		};

		socket?.on('startGame', handleStartGame);
		socket?.on('resumeGame', handleResumeGame);
		socket?.on('gameState', (newState: any) => {
			// Update your local game state based on newState
			// console.log('newState:', newState);
			globalGameState.set((state) => {
				state.ballX = newState.ballX;
				state.ballY = newState.ballY;
				state.paddleY[0] = newState.paddleY[0];
				state.paddleY[1] = newState.paddleY[1];
				state.score.creator = newState.score.creator;
				state.score.joiner = newState.score.joiner;
				localStorage.setItem('pongGameState', JSON.stringify(state)); // Store the state in local storage
				return state;
			});
		});
		socket?.on('gameOver', handleGameOver);

		return () => {
			// Cleanup by removing event listeners when the component unmounts
			socket?.off('startGame', handleStartGame);
			socket?.off('gameState');
			socket?.off('gameOver', handleGameOver);
		};
	}, [socket]);

	// Function to render the game over screen
	const renderGameOverScreen = (context: any, data: any) => {
		// Clear the canvas and display game over text and scores
		context.clearRect(0, 0, globalGameState.width.get(), globalGameState.height.get());
		context.fillStyle = 'white';
		context.font = '32px Courier New';
		context.fillText(`Game Over! Winner: ${data.winner}`, 100, 200);
		context.fillText(
			`Final Score - Creator: ${data.creatorScore}, Joiner: ${data.joinerScore}`,
			100,
			250,
		);
	};

	const renderCanvas = (context: CanvasRenderingContext2D) => {
		if (!context) {
			console.log('context is null, returning');
			return;
		}
		if (isGameOver) {
			const winner = globalGameState.winner.get();
			renderGameOverScreen(context, { winner, ...globalGameState.score.get() });
			return;
		}
		// Clear the canvas
		context.clearRect(0, 0, globalGameState.width.get(), globalGameState.height.get());

		const backgroundImageUrl = globalGameState.backgroundImage.get();

		if (backgroundImageUrl !== 'null') {
			context.drawImage(img, 0, 0, globalGameState.width.get(), globalGameState.height.get());
			if (globalGameState.onGame.get() === false) {
				renderIntro(context, 'Waiting for opponent...');
			}
			renderLeftPaddle(context);
			renderRightPaddle(context);
			renderCenterLine(context);
			renderBall(context);
			renderScore(context);
		} else {
			// No background image, fill with background color
			context.fillStyle = globalGameState.background.get();
			context.fillRect(0, 0, globalGameState.width.get(), globalGameState.height.get());
			renderLeftPaddle(context);
			renderRightPaddle(context);
			renderCenterLine(context);
			renderBall(context);
			renderScore(context);
		}
	};

	function renderLeftPaddle(context: CanvasRenderingContext2D) {
		if (!context) return;
		// Paddle Color
		context.fillStyle = globalGameState.paddleColor.get();
		context.fillRect(
			10,
			globalGameState.paddleY[0].get() - globalGameState.paddleWidth.get() / 2,
			globalGameState.paddleHeight.get(),
			globalGameState.paddleWidth.get(),
		);
	}

	function renderRightPaddle(context: CanvasRenderingContext2D) {
		if (!context) return;
		// Paddle Color
		context.fillStyle = globalGameState.paddleColor.get();
		context.fillRect(
			globalGameState.width.get() - 10 - globalGameState.paddleHeight.get(),
			globalGameState.paddleY[1].get() - globalGameState.paddleWidth.get() / 2,
			globalGameState.paddleHeight.get(),
			globalGameState.paddleWidth.get(),
		);
	}

	function renderCenterLine(context: CanvasRenderingContext2D) {
		if (!context) return;
		context.beginPath();
		context.setLineDash([12]);
		context.moveTo(350, 0);
		context.lineTo(350, 500);
		context.strokeStyle = globalGameState.strokeColor.get();
		context.stroke();
	}

	function renderBall(context: CanvasRenderingContext2D) {
		if (!context) return;
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

	function renderScore(context: CanvasRenderingContext2D) {
		if (!context) return;
		context.font = '32px Courier New';
		context.fillText(gameState.score.creator.get().toString(), 310, 50);
		context.fillText(gameState.score.joiner.get().toString(), 370, 50);
	}

	function renderIntro(context: CanvasRenderingContext2D, text: any) {
		// Canvas Background
		if (!context) return;
		// context.fillStyle = globalGameState.background.get();
		// context.fillRect(0, 0, globalGameState.width.get(), globalGameState.height.get());

		// Intro Text
		context.fillStyle = 'white';
		context.font = '32px Courier New';
		context.fillText(text, 130, globalGameState.height.get() / 3 - 30);
	}

	function renderCountDown(context: CanvasRenderingContext2D, count: number, img: any) {
		// Canvas Background
		if (!context) return;

		const backgroundImageUrl = globalGameState.backgroundImage.get();
		if (backgroundImageUrl !== 'null') {
			context.drawImage(img, 0, 0, globalGameState.width.get(), globalGameState.height.get());
			context.fillStyle = 'white';
			context.font = '70px Courier New';
			context.fillText(
				`${count}`,
				globalGameState.width.get() / 2,
				globalGameState.height.get() / 2 - 30,
			);
		} else {
			context.fillStyle = globalGameState.background.get();
			context.fillRect(0, 0, globalGameState.width.get(), globalGameState.height.get());
			context.fillStyle = 'white';
			context.font = '70px Courier New';
			context.fillText(
				`${count}`,
				globalGameState.width.get() / 2,
				globalGameState.height.get() / 2 - 30,
			);
		}

		// Intro Text
	}

	// function renderCountDown(context: any, count: any) {
	//     context.clearRect(0, 0, globalGameState.width.get(), globalGameState.height.get());
	//     context.fillStyle = 'white';
	//     context.font = '70px Courier New';
	//     context.fillText(`${count}`, globalGameState.width.get() / 2, globalGameState.height.get() / 2);
	// }

	// Called Every Frame
	const animate = () => {
		const { context } = getCanvasAndContext();
		if (context && imageRef.current) {
			context.clearRect(0, 0, globalGameState.width.get(), globalGameState.height.get());
			renderCanvas(context);
		}
		if (globalGameState.winner.get() === 'null') {
			animationFrameId.current = window.requestAnimationFrame(animate);
		} else {
			console.log('globalGameState.winner.get() is true');
			console.log('animationFrameId.current:', animationFrameId.current);
			console.log('globalGameState.paddleIndex.get():', globalGameState.paddleIndex.get());
			console.log('globalGameState.isReferee.get():', globalGameState.isReferee.get());
			console.log('globalGameState.onGame.get():', globalGameState.onGame.get());
			console.log('globalGameState.winner.get():', globalGameState.winner.get());
		}
	};

	const startGame = () => {
		globalGameState.paddleIndex.set(globalGameState.isReferee.get() ? 1 : 0);
		animationFrameId.current = window.requestAnimationFrame(animate);
		console.log('inside startGame()');
		console.log('animationFrameId.current:', animationFrameId.current);
		console.log('globalGameState.paddleIndex.get():', globalGameState.paddleIndex.get());
		console.log('globalGameState.isReferee.get():', globalGameState.isReferee.get());
		console.log('globalGameState.onGame.get():', globalGameState.onGame.get());

		const paddleSpeed = 15;

		const handleKeyDown = (e: KeyboardEvent) => {
			let newY;
			if (e.key === 'ArrowUp') {
				newY = Math.max(
					globalGameState.paddleY[globalGameState.paddleIndex.get()].get() - paddleSpeed,
					0,
				);
				console.log('globalGameState.paddleIndex.get()->', globalGameState.paddleIndex.get());
			} else if (e.key === 'ArrowDown') {
				newY = Math.min(
					globalGameState.paddleY[globalGameState.paddleIndex.get()].get() + paddleSpeed,
					globalGameState.height.get(),
				);
			}

			if (newY !== undefined) {
				socket?.emit('paddleMove', {
					userId: currentUserId,
					paddleY: newY,
				});
			}
		};

		// Listen for keydown events
		document.addEventListener('keydown', handleKeyDown);
		const { canvas } = getCanvasAndContext();
		console.log('canvas: ', canvas);
		console.log('canvas.style: ', canvas.style);
		// Hide Cursor
		canvas.style.cursor = 'none';
	};

	return (
		<div style={{ display: 'flex' }}>
			<canvas
				style={{ margin: 'auto' }}
				id="canvas-game"
				width={globalGameState.width.get()}
				height={globalGameState.height.get()}
			></canvas>
		</div>
	);
};

export default PongGame;
