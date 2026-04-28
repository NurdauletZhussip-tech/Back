import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import childReducer from './childSlice';
import lessonReducer from './lessonSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    child: childReducer,
    lesson: lessonReducer,
  },
});