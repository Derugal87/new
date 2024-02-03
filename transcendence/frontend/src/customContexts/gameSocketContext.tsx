

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useHookstate } from '@hookstate/core';
import { glbGameSocket } from '../stores/game/glbGameSocketStore';
import { glbUserStore } from '../stores/user/userStore';
import { glbLoginStore } from '../stores/loginAuth/loginStore';

const GameSocketContext = createContext<Socket | null>(null);

export const useGameSocket = () => useContext(GameSocketContext);

export const GameSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const globalGameSocket = useHookstate(glbGameSocket);
	const globalUserStore = useHookstate(glbUserStore);
	const globalLoginStore = useHookstate(glbLoginStore);

	useEffect(() => {
		let currentUserId: any = localStorage.getItem('user_id');
		if (!currentUserId) {
			console.log('Not logged in, not connecting to game socket');
			return; // Do not establish socket if user is not logged in
		}
		// currentUserId = parseInt(currentUserId, 10);
		console.log('Connecting to game socket as:' + currentUserId);
		const newSocket = io('http://localhost:4000/pong', {
			withCredentials: true,
			query: { userId: currentUserId },
			reconnection: true, // Enable automatic reconnection
			reconnectionAttempts: Infinity, // Unlimited reconnection attempts
			reconnectionDelay: 250, // Initial delay for reconnection
			reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
			randomizationFactor: 0.1, // Randomization factor for delay
		});

		newSocket.on('connect', () => {
			console.log('Connected to game socket as:' + newSocket.id + ' with userId: ' + currentUserId);
			// newSocket.emit('setUserId', { userId: currentUserId });
		});

		newSocket.on('disconnect', (reason) => {
			console.log('Game socket disconnected:', reason);
		});

		globalGameSocket.set(newSocket);

		return () => {
			// Clean-up: Disconnect socket when user logs out or application closes
			if (newSocket && (!globalUserStore.get() || !globalLoginStore.get())) {
				newSocket.disconnect();
			}
		};
	}, [globalUserStore, globalLoginStore]); // Dependencies

	return (
		<GameSocketContext.Provider value={globalGameSocket.get()}>
			{children}
		</GameSocketContext.Provider>
	);
};
