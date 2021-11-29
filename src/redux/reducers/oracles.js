import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { useSelector } from "react-redux";

const initialState = { oraclesInfoObj: new Object() };

const slice = createSlice({
	name: "oracles",
	initialState,
	reducers: {
		sUpdateOraclesInfoObj(state, action) {
			if (
				action.payload &&
				Array.isArray(action.payload) &&
				action.payload.length > 0
			) {
				let updateOraclesInfo = {
					...state.oraclesInfoObj,
				};
				action.payload.forEach((info) => {
					if (info.oracleAddress) {
						updateOraclesInfo[info.oracleAddress] = {
							oracleAddress: info.oracleAddress,
							name: info.name,
						};
					}
				});

				state.oraclesInfoObj = updateOraclesInfo;
			}
		},
	},
});

export const { sUpdateOraclesInfoObj } = slice.actions;

export const selectOracleInfoObj = (state) => state.oracles.oraclesInfoObj;
export default slice.reducer;
