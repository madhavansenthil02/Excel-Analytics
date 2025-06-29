import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerUserAPI, loginUserAPI } from '../../api/api';
import setAuthToken from '../../utils/setAuthToken';
import axios from 'axios';

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUserAPI(userData); // calling from api.js
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, thunkAPI) => {
    try {
      const response = await loginUserAPI(userData);

      const { token, user } = response.data;

      // Save token to localStorage (optional)
      localStorage.setItem('token', res.data.token);

      return { token, user };
    } catch (error) {
      const message =
        error.response && error.response.data && error.response.data.msg
          ? error.response.data.msg
          : 'Something went wrong';

      return thunkAPI.rejectWithValue(message);
    }
  }
);


//LoadUser
export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
  const token = localStorage.getItem('token');
  if (token) setAuthToken(token);
  const res = await axios.get('/api/auth/me');
  return res.data;
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    loginSuccess: (state) => {
      state.success = true;
    }
  },
  extraReducers: (builder) => {
    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { logout, clearError, setUser, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
