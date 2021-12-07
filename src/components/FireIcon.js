import { Icon } from "@chakra-ui/icons";

export function FireIcon({ fill, ...props }) {
	return (
		<Icon viewBox="0 0 64 64" {...props}>
			<path
				fill={fill}
				d="M49 13c-6.941 6.11-6 16-6 16S32.82 13.492 37 1c-4.082 8.425-22 10.59-14 34-10.125-3.824-10-16-10-16s-6 6-6 18a24 24 0 0 0 48 0c0-12.16-8.691-12.141-6-24z"
				data-name="layer2"
			></path>
		</Icon>
	);
}
