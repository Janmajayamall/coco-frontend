import { createSlice } from "@reduxjs/toolkit";

const initialState = { profile: undefined };

const slice = createSlice({
	name: "user",
	initialState,
	reducers: {
		updateProfile(state, action) {
			state.profile = action.payload;
		},
	},
});

export const { increment, decrement, incrementByAmount } = slice.actions;
export default slice.reducer;
