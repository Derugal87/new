import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';

interface TeamMemberProps {
	name: string;
	role: string;
	linkedin: string;
	github: string;
	imageSrc: string;
}

const TeamMember = ({ name, role, linkedin, github, imageSrc }: TeamMemberProps) => {
	return (
		<div className="intro_box">
			<div className="circular-image-wrapper">
				<img className="intro_pics" alt={name} src={imageSrc} />
			</div>
			<h2 className="intro_header2">{name}</h2>
			<h3 className="intro_header3">{role}</h3>
			<div className="social-links">
				<a rel="noreferrer" href={linkedin} target="_blank">
					<i className="fab fa-linkedin fa-inverse ok"></i>
				</a>
				<a rel="noreferrer" href={github} target="_blank">
					<i className="fab fa-github fa-inverse ok"></i>
				</a>
			</div>
		</div>
	);
};

export default TeamMember;
