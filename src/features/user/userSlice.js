import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  uid: "",
  dateOfBirth: "",
  description: "",
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    userLoggedIn(state, action) {
      const { user, userId, description, dateOfBirth } = action.payload;
      return {
        user,
        uid: userId,
        description,
        dateOfBirth,
      };
    },
    userLoggedOut(state) {
      state.user = null;
      state.uid = "";
      state.description = "";
      state.dateOfBirth = "";
    },
    userUpdated(state, action) {
      const { username, description, dateOfBirth } = action.payload;
      state.user = username;
      state.dateOfBirth = dateOfBirth;
      state.description = description;
    },
  },
});

export default userSlice.reducer;

export const { userLoggedIn, userLoggedOut, userUpdated } = userSlice.actions;
