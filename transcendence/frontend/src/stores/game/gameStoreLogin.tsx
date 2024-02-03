import { hookstate } from '@hookstate/core';

const initialGameState = {
	background: '#000000',
	backgroundImage: 'null',
	isReferee: false,
	paddleIndex: 0,
	width: 1400,
	height: 1000,
	speedY: 2,
	speedX: 2,
	score: [0, 0],
	scoreLimit: 11,

	ballX: 700,
	ballY: 500,
	ballRadius: 10,
	ballDirection: 1,
	ballColor: '#ffffff',

	paddleColor: '#ffffff',
	paddleHeight: 20,
	paddleWidth: 100,
	paddleX: [700, 700],
	playerMoved: false,
	winner: null as 0 | 1 | null,
	onGame: false,

	strokeColor: '#7FC7D9',
	introColor: '#ffffff',
};

export const gameStateLogin = hookstate(initialGameState);
