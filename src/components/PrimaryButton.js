import { Text, Button } from "@chakra-ui/react";

function PrimaryButton({ title, ...children }) {
	return (
		<Button
			{...children}
			backgroundColor="#0B0B0B"
			_hover={{
				border: "1px",
				borderStyle: "solid",
				borderColor: "blue.400",
				backgroundColor: "gray.700",
			}}
			border="1px solid transparent"
			borderRadius="xl"
		>
			<Text color="#FDFDFD">{title}</Text>
		</Button>
	);
}

export default PrimaryButton;