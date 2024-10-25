// src/store/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchUserDetails = createAsyncThunk('user/fetchUserDetails', async () => {
  const response = await axios.get('/api/user-detail');
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    status: 'idle',
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
