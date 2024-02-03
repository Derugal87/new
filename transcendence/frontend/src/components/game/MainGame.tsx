import { useHookstate } from '@hookstate/core';
import '../../styles/MainGame.style.css'; // Import the CSS file
import PongGame from './GameTest';
import { useNavigate } from 'react-router-dom';
import { gameState } from '../../stores/game/gameStore';
import { gameModePlayer } from '../../stores/game/gameModePlayer';
import { useEffect, useState } from 'react';
// import game socket context
import { useGameSocket } from '../../customContexts/gameSocketContext';

const MainGame = () => {
	const navigate = useNavigate();
	const globalGameState = useHookstate(gameState);
	const glbGameModePlayer = useHookstate(gameModePlayer);
	const [text, setText] = useState('');
	const socket = useGameSocket();

	const resetGlobalGameState = () => {
		globalGameState.background.set('#000000');
		globalGameState.backgroundImage.set('null');
		globalGameState.isReferee.set(false);
		globalGameState.paddleIndex.set(0);
		globalGameState.width.set(700);
		globalGameState.height.set(500);
		globalGameState.speedY.set(4);
		globalGameState.speedX.set(4);
		globalGameState.score.set({ creator: 0, joiner: 0 });
		globalGameState.scoreLimit.set(5);
		globalGameState.ballX.set(350);
		globalGameState.ballY.set(250);
		globalGameState.ballRadius.set(5);
		globalGameState.ballDirection.set(1);
		globalGameState.ballColor.set('#ffffff');
		globalGameState.paddleColor.set('#ffffff');
		globalGameState.paddleHeight.set(10);
		globalGameState.paddleWidth.set(50);
		globalGameState.paddleY.set([250, 250]);
		globalGameState.paddleX.set([350, 350]);
		globalGameState.playerMoved.set(false);
		globalGameState.winner.set('null');
		globalGameState.onGame.set(false);
		globalGameState.strokeColor.set('#ffffff');
		globalGameState.creatorNickname.set('null');
		globalGameState.joinerNickname.set('null');
	};

	useEffect(() => {
		if (globalGameState.winner.get() === 'You') {
			setText('You won!');
			resetGlobalGameState();
		} else if (globalGameState.winner.get() === 'Opponent') {
			setText('You lost!');
			resetGlobalGameState();
		}
	}, [globalGameState.winner.get()]);

	useEffect(() => {
		if (text === 'You won!' || text === 'You lost!') {
			const timeoutId = setTimeout(() => {
				globalGameState.winner.set('null');
				navigate('/game');
			}, 5000);
			return () => clearTimeout(timeoutId);
		}
	}, [text]);

	const handleClick = () => {
		navigate('/game');
		gameModePlayer.set('null');
		globalGameState.onGame.set(false);
		localStorage.removeItem('pongGameState');
		console.log('quitting in-game by user', localStorage.getItem('user_id'), 'socket:', socket);
		socket?.emit('quit', { userId: localStorage.getItem('user_id') });
		
	};

	const handleCancelGame = () => {
		gameModePlayer.set('null');
		globalGameState.onGame.set(false);
		localStorage.removeItem('pongGameState');
		console.log('quitting game by user', localStorage.getItem('user_id'), 'socket:', socket);
		socket?.emit('quit', { userId: localStorage.getItem('user_id') });
		//if i am invited someone, i will cancel the game and the other person will be notified, and other person notificaion will be deleted, Oz should implement rejectGameInvitation in backend before this
		navigate('/game');
	};

	return (
		<>
			<div className="paddle-intro">Paddle movement: Arrow up and down</div>
			<div className="paddle-intro">{text}</div>
			<div className="paddle-intro">
				{globalGameState.creatorNickname.get() != 'null' &&
					`${globalGameState.creatorNickname.get()} vs ${globalGameState.joinerNickname.get()}`}
			</div>
			<div className="pop-up-container">
				<PongGame />
			</div>
			<div className="pop-up-buttons">
				{!globalGameState.onGame.get() ? (
					<button className="pop-up-button" onClick={handleCancelGame}>
						Cancel Game
					</button>
				) : (
					globalGameState.winner.get() === 'null' && (
						<button onClick={handleClick} className="pop-up-button">
							GIVE UP
						</button>
					)
				)}
			</div>
		</>
	);
};

export default MainGame;
