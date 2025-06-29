import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import excelReducer from './slices/excelSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    excel: excelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // allows FormData and non-serializable types
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
