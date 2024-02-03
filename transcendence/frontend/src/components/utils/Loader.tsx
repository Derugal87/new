import ContentLoader, { BulletList } from 'react-content-loader';
import '../../styles/Loader.style.css';

export default function Loader() {
	return (
		<svg
			className="spinner"
			width="65px"
			height="65px"
			viewBox="0 0 66 66"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				className="path"
				fill="none"
				strokeWidth="6"
				strokeLinecap="round"
				cx="33"
				cy="33"
				r="30"
			></circle>
		</svg>
	);
}

export const MyBulletListLoader = () => <BulletList />;

export const MyLoader = () => (
	<ContentLoader
		height={140}
		speed={2}
		backgroundColor={'#fff'}
		foregroundColor={'#888'}
		viewBox="0 0 380 70"
	>
		{/* Only SVG shapes */}
		<rect x="50" y="20" rx="5" ry="5" width="20" height="20" />
		<rect x="80" y="17" rx="4" ry="4" width="300" height="13" />
		<rect x="80" y="40" rx="3" ry="3" width="250" height="10" />
		<rect x="80" y="60" rx="3" ry="3" width="250" height="10" />
	</ContentLoader>
);

export const CustomContentLoader = () => (
	<ContentLoader
		speed={2}
		height={140}
		backgroundColor={'#fff'}
		foregroundColor={'#888'}
		viewBox="0 0 100 70"
	>
		{/* Title */}
		<rect x="20" y="20" rx="5" ry="5" height="20" />

		{/* 100% width image */}
		<rect x="20" y="50" rx="5" ry="5" height="70" />

		{/* Channel member list */}
		<rect x="50" y="20" rx="5" ry="5" width="20" height="20" />
		<rect x="80" y="17" rx="4" ry="4" width="300" height="13" />
		<rect x="80" y="40" rx="3" ry="3" width="250" height="10" />
		<rect x="80" y="60" rx="3" ry="3" width="250" height="10" />
		{/* Add more member list items as needed */}
	</ContentLoader>
);

export const CustomLoader = () => {
	return (
		<div className="lds-default">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
};
