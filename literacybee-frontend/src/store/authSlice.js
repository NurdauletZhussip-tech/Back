import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
export const loginAsChild = createAsyncThunk('auth/loginAsChild', async ({ childId, pin }) => {
  const res = await api.post('/auth/child/login', { childId, pin });
  return res.data;
});
export const registerParent = createAsyncThunk('auth/register', async ({ email, password, name }) => {
  const res = await api.post('/auth/register', { email, password, name });
  return res.data;
});

export const loginParent = createAsyncThunk('auth/login', async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
});

export const loginChild = createAsyncThunk('auth/childLogin', async ({ childId, pin }) => {
  const res = await api.post('/auth/child/login', { childId, pin });
  return res.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, role: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerParent.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = 'parent';
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginParent.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = 'parent';
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginChild.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = 'child';
        localStorage.setItem('token', action.payload.token);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;