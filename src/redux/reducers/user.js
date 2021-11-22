import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { useSelector } from "react-redux";

const initialState = { profile: undefined, groupsFollowed: new Object() };

const slice = createSlice({
	name: "user",
	initialState,
	reducers: {
		sUpdateProfile(state, action) {
			console.log(state, action, "mmkmkm");
			state.profile = action.payload;
		},
		sUpdateGroupsFollowed(state, action) {
			if (action.payload && Array.isArray(action.payload)) {
				let groupsFollowed = new Object();
				action.payload.forEach((obj) => {
					if (obj.moderatorAddress) {
						groupsFollowed[obj.moderatorAddress] = true;
					}
				});
				state.groupsFollowed = groupsFollowed;
			}
		},
		sAddGroupFollow(state, action) {
			if (action.payload && typeof action.payload == "string") {
				let updatedValues = {
					...state.groupsFollowed,
				};
				updatedValues[action.payload] = true;
				state.groupsFollowed = updatedValues;
			}
		},
		sDeleteGroupFollow(state, action) {
			if (action.payload && typeof action.payload == "string") {
				let updatedValues = {
					...state.groupsFollowed,
				};
				delete updatedValues[action.payload];
				state.groupsFollowed = updatedValues;
			}
		},
	},
});

export const {
	sUpdateProfile,
	sUpdateGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
} = slice.actions;

export const selectUserProfile = (state) => state.user.profile;
export const selectGroupsFollowed = (state) => state.user.groupsFollowed;
export default slice.reducer;
