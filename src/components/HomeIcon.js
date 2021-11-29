import Icon from "@chakra-ui/icon";

/**
 * @ref https://orioniconlibrary.com/icon/real-estate-5959?from=query&name=home
 */
export function HomeIcon(props) {
	return (
		<Icon viewBox="0 0 64 64" {...props}>
			<path
				data-name="layer3"
				fill="#ef5940"
				d="M54 21.6V7h-9v7.4l9 7.2z"
			></path>
			<path data-name="layer2" fill="#bb806c" d="M23 39h18v22H23z"></path>
			<path
				data-name="layer1"
				fill="#e8ddc9"
				d="M32 4L10 21.6V61h13V39h18v22h13V21.6L32 4z"
			></path>
			<path
				data-name="opacity"
				fill="#000064"
				opacity=".2"
				d="M32 9l22 17.6v-5L32 4 10 21.6V61h5V23L32 9z"
			></path>
			<path
				data-name="opacity"
				fill="#000064"
				opacity=".2"
				d="M26 42v3h9v16h3V42H26z"
			></path>
			<path
				data-name="stroke"
				fill="none"
				stroke="#2e4369"
				stroke-linecap="round"
				stroke-miterlimit="10"
				stroke-width="2"
				d="M2 28L32 4l30 24M23 61V39h18v22"
				stroke-linejoin="round"
			></path>
			<path
				data-name="stroke"
				fill="none"
				stroke="#2e4369"
				stroke-linecap="round"
				stroke-miterlimit="10"
				stroke-width="2"
				d="M10 21.6V61h44V7h-9v7.445"
				stroke-linejoin="round"
			></path>
		</Icon>
	);
}