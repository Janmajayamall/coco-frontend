import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	loginModalState: {
		isOpen: false,
	},
	postTradeModal: {
		isOpen: false,
		marketIdentifier: undefined,
	},
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
			console.log(action.payload, "mkmkmmk");
			if (typeof action.payload.isOpen == "boolean") {
				state.postTradeModal.isOpen = action.payload.isOpen;
				state.postTradeModal.marketIdentifier =
					action.payload.marketIdentifier;
			}
		},
	},
});

export const { sUpdateLoginModalIsOpen, sUpdatePostTradeModal } = slice.actions;

export const selectLoginModalState = (state) => state.ui.loginModalState;
export const selectPostTradeModalState = (state) => state.ui.postTradeModal;

export default slice.reducer;
