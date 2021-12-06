import { InputGroup } from "@chakra-ui/react";
import { useRef } from "react";

function FileUpload(props) {
	const { accept, children, onFileUpload } = props;
	const inputRef = useRef(null);

	const handleClick = () => inputRef.current?.click();

	return (
		<InputGroup onClick={handleClick}>
			<input
				type={"file"}
				multiple={false}
				hidden
				accept={accept}
				onChange={(e) => {
					console.log(e.target.files, " it is insider")
					onFileUpload(e.target.files[0]);
				}}
				ref={(e) => {
					inputRef.current = e;
				}}
			/>
			<>{children}</>
		</InputGroup>
	);
}

export default FileUpload;
