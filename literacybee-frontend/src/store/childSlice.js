import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const fetchChildren = createAsyncThunk('child/fetchChildren', async () => {
  const res = await api.get('/parents/children');
  return res.data;
});

export const createChild = createAsyncThunk('child/createChild', async ({ name, pin }) => {
  const res = await api.post('/auth/children', { name, pin });
  return res.data;
});

export const fetchChildProgress = createAsyncThunk('child/fetchProgress', async (childId) => {
  const res = await api.get(`/children/${childId}/progress`);
  return { childId, progress: res.data };
});

const childSlice = createSlice({
  name: 'child',
  initialState: { children: [], progress: {}, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.children = action.payload;
      })
      .addCase(createChild.fulfilled, (state, action) => {
        state.children.push(action.payload);
      })
      .addCase(fetchChildProgress.fulfilled, (state, action) => {
        state.progress[action.payload.childId] = action.payload.progress;
      });
  },
});

export default childSlice.reducer;