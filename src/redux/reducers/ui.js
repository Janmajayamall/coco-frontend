import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	loginModalState: {
		isOpen: false,
	},
	postTradeModal: {
		isOpen: false,
		marketIdentifier: undefined,
	},
	rinkebyLatestBlockNumber: 0,
};

const slice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		sUpdateLoginModalIsOpen(state, action) {
			if (typeof action.payload != "boolean") {
				return;
			}
			state.loginModalState.isOpen = action.payload;
		},
		sUpdatePostTradeModal(state, action) {
			if (typeof action.payload.isOpen == "boolean") {
				state.postTradeModal.isOpen = action.payload.isOpen;
				state.postTradeModal.marketIdentifier =
					action.payload.marketIdentifier;
			}
		},
		sUpdateRinkebyLatestBlockNumber(state, action) {
			if (typeof action.payload == "number") {
				state.rinkebyLatestBlockNumber = action.payload;
			}
		},
	},
});

export const {
	sUpdateLoginModalIsOpen,
	sUpdatePostTradeModal,
	sUpdateRinkebyLatestBlockNumber,
} = slice.actions;

export const selectLoginModalState = (state) => state.ui.loginModalState;
export const selectPostTradeModalState = (state) => state.ui.postTradeModal;
export const selectRinkebyLatestBlockNumber = (state) =>
	state.ui.rinkebyLatestBlockNumber;

export default slice.reducer;
