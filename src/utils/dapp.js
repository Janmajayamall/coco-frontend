import { connectContractToSigner } from "@usedapp/core";
import { usePromiseTransaction } from "@usedapp/core/src/hooks/usePromiseTransaction";

export const useContractFunction = (contract, functionName, options = {}) => {
	const { library, chainId } = useEthers();
	const { promiseTransaction, state } = usePromiseTransaction(
		chainId,
		options
	);
	const [events, setEvents] = useState(undefined);

	const send = useCallback(
		async (...args) => {
			const contractWithSigner = connectContractToSigner(
				contract,
				options,
				library
			);
			const receipt = await promiseTransaction(
				contractWithSigner[functionName](...args).then((result) => {
					// Added Chain Id here to prevent "TypeError: Unsupported chain" message
					result.chainId = chainId;
					return result;
				})
			);
			if (receipt?.logs) {
				const events = receipt.logs.reduce((accumulatedLogs, log) => {
					try {
						return log.address === contract.address
							? [
									...accumulatedLogs,
									contract.interface.parseLog(log),
							  ]
							: accumulatedLogs;
					} catch (_err) {
						return accumulatedLogs;
					}
				});
				setEvents(events);
			}
		},
		[contract, functionName, options, library]
	);

	return { send, state, events };
};
