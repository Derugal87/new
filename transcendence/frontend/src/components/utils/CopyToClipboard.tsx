import React, { useState } from 'react';
import '../../styles/CopyToClipboard.style.css';

function CopyToClipboard(props: any) {
	const [joinToken, setJoinToken] = useState(props.joinToken);

	const copyToClipboard = () => {
		const tempTextArea = document.createElement('textarea');
		tempTextArea.value = joinToken;
		document.body.appendChild(tempTextArea);
		tempTextArea.select();
		document.execCommand('copy');
		document.body.removeChild(tempTextArea);

		// Update the joinToken or show a notification as desired
		alert('Join Token copied to clipboard!');
	};

	return (
		<div className="copy-container">
			<h3>Invitation Link</h3>
			<p>{joinToken}</p>
			<button onClick={copyToClipboard}>Copy Join Token</button>
		</div>
	);
}

export default CopyToClipboard;
