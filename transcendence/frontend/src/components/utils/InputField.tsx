interface InputFieldProps {
	labelTitle: string;
	type: string;
	id: string;
	placeholder: string;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	value: string;
}

const InputField = (props: InputFieldProps) => {
	return (
		<label htmlFor={props.id}>
			{props.labelTitle} : {` `}
			<input
				id={props.id}
				type={props.type}
				name={props.id}
				placeholder={props.placeholder}
				onChange={props.onChange}
				autoComplete="off"
				value={props.value}
			/>
		</label>
	);
};

export default InputField;
