import { hookstate } from '@hookstate/core';

const initialGameState = {
	background: '#000000',
	backgroundImage: 'null',
	isReferee: false,
	paddleIndex: 0,
	width: 700,
	height: 500,
	speedY: 4,
	speedX: 4,
	score: {
		creator: 0,
		joiner: 0,
	},
	scoreLimit: 5,

	ballX: 350,
	ballY: 250,
	ballRadius: 5,
	ballDirection: 1,
	ballColor: '#ffffff',

	paddleColor: '#ffffff',
	paddleHeight: 5,
	paddleWidth: 50,
	paddleY: [250, 250],
	paddleX: [350, 350],
	playerMoved: false,
	winner: 'null',
	onGame: false,

	strokeColor: '#ffffff',
	creatorNickname: 'null',
	joinerNickname: 'null',
};

export const gameState = hookstate(initialGameState);
