import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  headerText: 'Default Header Text',
};

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    updateHeaderText: (state, action) => {
      state.headerText = action.payload;
    },
  },
});

export const { updateHeaderText } = headerSlice.actions;

export default headerSlice.reducer;
