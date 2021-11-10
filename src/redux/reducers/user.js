import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { useSelector } from "react-redux";

const initialState = { profile: undefined };

const slice = createSlice({
	name: "user",
	initialState,
	reducers: {
		sUpdateProfile(state, action) {
			console.log(state, action, "mmkmkm");
			state.profile = action.payload;
		},
	},
});

export const { sUpdateProfile } = slice.actions;

export const selectUserProfile = (state) => state.user.profile;
export default slice.reducer;
