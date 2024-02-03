import { useEffect } from 'react';

type Props = {
	password: string;
	setPasswordStrength: (val: boolean) => void;
};
const PasswordStrengthIndicator = (props: Props) => {
	const getStrengthLevel = (password: string): string => {
		const minLength = 8;
		const hasUppercase = /[A-Z]/.test(password);
		const hasLowercase = /[a-z]/.test(password);
		const hasDigit = /\d/.test(password);

		if (hasUppercase && hasLowercase && hasDigit) {
			return 'strong';
		} else if ((hasUppercase && hasLowercase) || (hasLowercase && hasDigit)) {
			return 'medium';
		}
		return 'weak';
	};

	const strengthLevel = getStrengthLevel(props.password);
	useEffect(() => {
		if (strengthLevel !== 'weak') props.setPasswordStrength(true);
		else props.setPasswordStrength(false);
	}, [strengthLevel]);

	return (
		<div style={{ marginTop: '10px' }}>
			Password Strength:{' '}
			<span style={{ color: strengthLevel === 'strong' ? 'green' : 'red' }}>{strengthLevel}</span>
		</div>
	);
};

export default PasswordStrengthIndicator;
