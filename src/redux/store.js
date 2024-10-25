// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
