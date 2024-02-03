import { ReactElement, JSXElementConstructor } from 'react';
import '../styles/Container.style.css';

export default function Container(props: {
	children: ReactElement<any, string | JSXElementConstructor<any>> | null | undefined;
}) {
	return <div className="container">{props.children}</div>;
}
