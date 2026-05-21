import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

const getApiError = (error) => error.response?.data?.error || error.message || 'Request failed';

export const loginAsChild = createAsyncThunk('auth/loginAsChild', async ({ childId, pin }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/child/login', { childId, pin });
    return res.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});
export const registerParent = createAsyncThunk('auth/register', async ({ email, password, name }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', { email, password, name });
    return res.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const loginParent = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const loginChild = createAsyncThunk('auth/childLogin', async ({ childId, pin }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/child/login', { childId, pin });
    return res.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
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
        state.token = null;
        state.role = null;
        localStorage.removeItem('token');
      })
      .addCase(loginParent.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;

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
