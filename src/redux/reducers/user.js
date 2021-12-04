import { createSlice } from "@reduxjs/toolkit";
import { act } from "react-dom/test-utils";
import { useSelector } from "react-redux";

const initialState = {
	profile: undefined,
	groupsFollowed: new Object(),
	feedDisplayConfigs: { threshold: 50 },
};

const slice = createSlice({
	name: "user",
	initialState,
	reducers: {
		sUpdateProfile(state, action) {
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
		sUpdateThresholdOfFeedDisplayConfigs(state, action) {
			if (action.payload <= 100) {
				state.feedDisplayConfigs = {
					...state.feedDisplayConfigs,
					threshold: action.payload,
				};
			}
		},
	},
});

export const {
	sUpdateProfile,
	sUpdateGroupsFollowed,
	sAddGroupFollow,
	sDeleteGroupFollow,
	sUpdateThresholdOfFeedDisplayConfigs,
} = slice.actions;

export const selectUserProfile = (state) => state.user.profile;
export const selectGroupsFollowed = (state) => state.user.groupsFollowed;
export const selectFeedDisplayConfigs = (state) =>
	state.user.feedDisplayConfigs;
export default slice.reducer;
