import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const GroupChat = () => {
	const [socket, setSocket] = useState<any>(null);
	const [groupMessages, setGroupMessages] = useState([]);

	useEffect(() => {
		// Connect to the WebSocket server
		const newSocket = io('http://localhost:4000/group-messages', {
			query: { userId: 1 }, // Replace with the user's ID
		});

		setSocket(newSocket);

		return () => {
			// Disconnect the socket when the component unmounts
			if (newSocket) {
				newSocket.disconnect();
			}
		};
	}, []);

	useEffect(() => {
		if (!socket) return;

		// Listen for all group messages
		socket.on('allGroupMessages', (messages: any) => {
			console.log('test', messages);
			setGroupMessages(messages);
		});

		return () => {
			// Remove the message listener when the component unmounts
			socket.off('allGroupMessages');
		};
	}, [socket]);

	const requestAllGroupMessages = () => {
		// Request all group messages for a specific channel
		socket.emit('getAllGroupMessages', { channelId: 1, userId: 1 }); // Replace with the correct channel ID and user ID
	};

	return (
		<div>
			<button onClick={requestAllGroupMessages}>Get All Group Messages</button>
			<div>
				{groupMessages.map((message: any) => (
					<div key={message.id}>{message.content}</div>
				))}
			</div>
		</div>
	);
};

export default GroupChat;
