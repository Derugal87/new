import React, { ReactNode } from 'react';
import '../styles/Modal.style.css'; // Make sure to create a corresponding CSS file

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay">
			<div className="modal">
				<button onClick={onClose}>Close</button>
				{children}
			</div>
		</div>
	);
};

export default Modal;
