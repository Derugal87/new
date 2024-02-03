const WebSocket = require('websocket').w3cwebsocket;

console.log('Connecting to WebSocket server...');
// Replace 'ws://localhost:4000/' with your actual WebSocket server URL
const ws = new WebSocket('ws://localhost:4000/');

console.log('WebSocket client created.');
ws.onopen = function (event) {
  console.log('WebSocket connection established.');
  // Send a test message to the server
  ws.send('Hello, WebSocket Server!');
};

ws.onmessage = function (event) {
  console.log('Received message:', event.data);
};

ws.onclose = function (event) {
  console.log('WebSocket connection closed.');
};


// export const HomePage = () => {
// 	let socket = new WebSocket("ws://localhost:4000");
// 	console.log(socket);
// 	socket.onopen = function (e) {
// 	  alert("[open] Connection established");
// 	  alert("Sending to server");
// 	  socket.send("My name is John");
// 	};
  
// 	return (
// 	  <Container>
// 		<>
// 		  <Header />
// 		</>
// 	  </Container>
// 	);
//   };