import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { DAppProvider } from "@usedapp/core";
import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.render(
	<React.StrictMode>
		<DAppProvider
			config={{
				supportedChains: [421611],
				// multicallAddresses: {
				// 	421611: "0xed53fa304E7fcbab4E8aCB184F5FC6F69Ed54fF6",
				// },
			}}
		>
			<ChakraProvider>
				<App />
			</ChakraProvider>
		</DAppProvider>
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
