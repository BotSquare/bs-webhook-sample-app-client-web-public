import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import streamReducer from '../features/stream/streamSlice';

export const store = configureStore({
  reducer: {
    stream: streamReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
