//
import Container from '../components/Container';
import Header from '../components/Header';

import '../styles/GamePage.style.css';
import { useNavigate } from 'react-router-dom';
import { useHookstate } from '@hookstate/core';
import { gameModePlayer } from '../stores/game/gameModePlayer';
import { useEffect, useState } from 'react';
import { useAuthUtils } from '../utils/authUtils';

const GameRules = () => {
	return (
		<div className="game-text">
			<h1 className="centered-text">GAME RULES</h1>
			<p>
				<strong>Starting the Game:</strong>
			</p>
			<ul>
				<li>The game starts with the ball positioned at the center of the game area.</li>
				<li>Each player's paddle is positioned on their respective side of the game area.</li>
			</ul>
			<p>
				<strong>Scoring:</strong>
			</p>
			<ul>
				<li>
					Players score points when the ball passes their opponent's paddle and goes off-screen.
				</li>
				<li>Typically, a player scores one point each time they successfully score.</li>
			</ul>
			<p>
				<strong>Game Movement:</strong>
			</p>
			<ul>
				<li>
					Players can move their paddles left and right using the mouse to intercept and prevent the
					ball from passing.
				</li>
				<li>The ball initially moves in a random direction when the game starts.</li>
			</ul>
			<p>
				<strong>Bouncing:</strong>
			</p>
			<ul>
				<li>
					When the ball hits the left or right wall of the game area, it bounces off at opposite
					direction.
				</li>
				<li>When the ball hits a paddle, it also bounces off in the opposite direction.</li>
			</ul>
			<p>
				<strong>Winning the Game:</strong>
			</p>
			<ul>
				<li>The game can be played to a predefined score limit.</li>
				<li>
					The player who reaches the score limit first or has the highest score when the game ends
					wins.
				</li>
			</ul>
		</div>
	);
};

const Achievements = () => {
	return (
		<div className="game-text">
			<h1 className="centered-text">ACHIEVEMENTS</h1>
			<p>
				<strong>Rookie Sensation:</strong>
			</p>
			<ul>
				<li>Win your first Pong match.</li>
			</ul>
			<p>
				<strong>Consistent Performer:</strong>
			</p>
			<ul>
				<li>Play 10 Pong matches.</li>
			</ul>
			<p>
				<strong>Experienced Player:</strong>
			</p>
			<ul>
				<li>Play 100 Pong matches.</li>
			</ul>
			<p>
				<strong>Dominant Force:</strong>
			</p>
			<ul>
				<li>Achieve a perfect victory (winning 5-0 or 4-0, etc.).</li>
			</ul>
			<p>
				<strong>Decade of Dominance:</strong>
			</p>
			<ul>
				<li> Achieve 10 victories in Pong.</li>
			</ul>
			<p>
				<strong>Rock Bottom Survivor:</strong>
			</p>
			<ul>
				<li>Have 0 points in a Pong match.</li>
			</ul>
			<p>
				<strong>Master of the Arena:</strong>
			</p>
			<ul>
				<li>Reach a rating of 1600 in Pong.</li>
			</ul>
		</div>
	);
};

function PageMap() {
	const glbGameModePlayer = useHookstate(gameModePlayer);
	const navigate = useNavigate();

	const handleCreateGameButton = () => {
		glbGameModePlayer.set('creator');
		navigate('/game/settings');
	};

	const handleJoinButton = () => {
		glbGameModePlayer.set('joiner');
		navigate('/game/start');
	};

	return (
		<div className="appContainer">
			<div className="game-mode-buttons">
				<button onClick={handleCreateGameButton} className="game-mode-create">
					CREATE GAME
				</button>
				<button onClick={handleJoinButton} className="game-mode-join">
					JOIN GAME
				</button>
			</div>
			<GameRules />
			<Achievements />
		</div>
	);
}

export default function GamePage() {
	const navigate = useNavigate();
	const { isLoggedIn } = useAuthUtils('http://localhost:4000');

	useEffect(() => {
		const checkLogin = async () => {
			try {
				const result = await isLoggedIn();
				if (!result.isValid) {
					navigate('/'); // Redirect to the login page if not logged in
				} else {
				}
			} catch (error) {
				console.error('Error checking login', error);
			}
		};
		checkLogin();
	}, [isLoggedIn, navigate]); // Add dependencies here
	return (
		<Container>
			<>
				<Header />
				<PageMap />
			</>
		</Container>
	);
}
