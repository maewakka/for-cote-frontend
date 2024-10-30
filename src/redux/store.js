// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../store/userSlice';
import logger from 'redux-logger';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store; // 기본 내보내기 사용
