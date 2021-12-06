import { Spinner, Flex } from "@chakra-ui/react";

function Loader() {
	return (
		<Flex alignItems="center" justifyContent="center">
			<Spinner size={"xl"} color="red.500" />
		</Flex>
	);
}

export default Loader;
