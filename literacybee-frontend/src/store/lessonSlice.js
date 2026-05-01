import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// 1. Получение уроков (с поддержкой пагинации)
export const fetchLessons = createAsyncThunk('lesson/fetchLessons', async (params = { page: 1, limit: 10 }) => {
  const { page, limit } = params;
  const res = await api.get(`/lessons?page=${page}&limit=${limit}`);
  return res.data; // Ожидаем { data: [...], meta: {...} }
});

// 2. Создание урока (Админ)
export const createLesson = createAsyncThunk('lesson/createLesson', async (lessonData) => {
  const res = await api.post('/admin/lessons', lessonData);
  return res.data;
});

// 3. Обновление урока (Админ)
export const updateLesson = createAsyncThunk('lesson/updateLesson', async ({ id, data }) => {
  const res = await api.put(`/admin/lessons/${id}`, data);
  return res.data;
});

// 4. Удаление урока (Админ)
export const deleteLesson = createAsyncThunk('lesson/deleteLesson', async (id) => {
  await api.delete(`/admin/lessons/${id}`);
  return id;
});

// 5. Твой старый метод для отправки ответа (оставляем как был)
export const submitExercise = createAsyncThunk('lesson/submitExercise', async ({ childId, exerciseId, answer }) => {
  const res = await api.post(`/lessons/child/${childId}/exercise/${exerciseId}`, { answer });
  return res.data;
});

const lessonSlice = createSlice({
  name: 'lesson',
  initialState: {
    lessons: [],
    meta: { totalPages: 0, currentPage: 1, totalItems: 0 },
    currentResult: null,
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.lessons = action.payload.data || action.payload; // Защита на случай, если бэк еще не шлет .data
        state.meta = action.payload.meta || state.meta;
      })
      // Create
      .addCase(createLesson.fulfilled, (state, action) => {
        state.lessons.push(action.payload);
      })
      // Update
      .addCase(updateLesson.fulfilled, (state, action) => {
        const index = state.lessons.findIndex(l => l.id === action.payload.id);
        if (index !== -1) state.lessons[index] = action.payload;
      })
      // Delete
      .addCase(deleteLesson.fulfilled, (state, action) => {
        state.lessons = state.lessons.filter(l => l.id !== action.payload);
      })
      // Submit
      .addCase(submitExercise.fulfilled, (state, action) => {
        state.currentResult = action.payload;
      });
  },
});

export default lessonSlice.reducer;