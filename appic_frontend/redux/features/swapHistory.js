import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

const initialSwapHistory = { history: [] };

const swapHistorySlice = createSlice({
  name: 'swapHistory',
  initialState: initialSwapHistory,
  reducers: {
    // Action to setCoins for the first time
    initHistory: (state, action) => {
      state.history = action.payload;
    },
    // Action to reset Coins array
    resetHistory: (state) => {
      state.history = [];
    },
  },
});

export const swapHistoryReducer = swapHistorySlice.reducer;
export const { initHistory, resetHistory } = swapHistorySlice.actions;

