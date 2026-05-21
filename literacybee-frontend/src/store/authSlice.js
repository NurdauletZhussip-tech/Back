import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

const getApiError = (error) => error.response?.data?.error || error.message || 'Request failed';

function getStoredAuth() {
  const token = localStorage.getItem('token');
  if (!token) return { user: null, token: null, role: null };

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      user: {
        id: payload.userId,
        role: payload.role
      },
      token,
      role: payload.role
    };
  } catch {
    localStorage.removeItem('token');
    return { user: null, token: null, role: null };
  }
}

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

export const resendVerification = createAsyncThunk('auth/resendVerification', async ({ email }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/resend-verification', { email });
    return res.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async ({ email }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data;
  } catch (error) {
    return rejectWithValue(getApiError(error));
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Local session must be cleared even if the refresh cookie is already gone.
  }
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { ...getStoredAuth(), loading: false, error: null },
  reducers: {
    clearAuth: (state) => {
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
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.role = null;
        localStorage.removeItem('token');
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
