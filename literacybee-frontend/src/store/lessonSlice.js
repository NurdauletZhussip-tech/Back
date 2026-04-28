import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchLessons = createAsyncThunk('lesson/fetchLessons', async () => {
  const res = await api.get('/lessons');
  return res.data;
});

export const submitExercise = createAsyncThunk('lesson/submitExercise', async ({ childId, exerciseId, answer }) => {
  const res = await api.post(`/lessons/child/${childId}/exercise/${exerciseId}`, { answer });
  return res.data;
});

const lessonSlice = createSlice({
  name: 'lesson',
  initialState: { lessons: [], currentResult: null, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.lessons = action.payload;
      })
      .addCase(submitExercise.fulfilled, (state, action) => {
        state.currentResult = action.payload;
      });
  },
});

export default lessonSlice.reducer;