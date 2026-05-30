import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import bloodReducer from './bloodSlice';
import bloodAppealReducer from './bloodAppealSlice';
import bloodDonatedReducer from './bloodDonatedSlice';
import feedbackReducer from './feedbackSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blood: bloodReducer,
    bloodAppeal: bloodAppealReducer,
    bloodDonated: bloodDonatedReducer,
    feedback: feedbackReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
