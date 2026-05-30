import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, push, update, remove } from 'firebase/database';
import { db } from '../firebaseConfig'; // Import your Firebase DB instance

// FETCH NOTIFICATIONS
export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async (_, thunkAPI) => {
    try {
      const notifRef = ref(db, 'notifications');
      const snapshot = await get(notifRef);

      if (snapshot.exists()) {
        const notifObject = snapshot.val();
        // Convert Firebase object to an array and attach the Firebase unique ID
        const notifArray = Object.keys(notifObject).map(key => ({
          id: key,
          ...notifObject[key]
        }));
        return notifArray;
      } else {
        return []; // Return empty array if no notifications exist
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch notifications");
    }
  }
);

// ADD NOTIFICATION
export const addNotification = createAsyncThunk(
  "notification/add",
  async (notificationData: any, thunkAPI) => {
    try {
      const notifRef = ref(db, 'notifications');
      const newNotifRef = await push(notifRef, notificationData);

      return {
        message: "Notification added successfully",
        notification: { id: newNotifRef.key, ...notificationData }
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to add notification");
    }
  }
);

// UPDATE NOTIFICATION
export const updateNotification = createAsyncThunk(
  "notification/update",
  async ({ id, ...data }: { id: string, [key: string]: any }, thunkAPI) => {
    try {
      const notifRef = ref(db, `notifications/${id}`);
      await update(notifRef, data); // Updates only the provided keys

      return {
        message: "Notification updated successfully",
        notification: { id, ...data }
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to update notification");
    }
  }
);

// DELETE NOTIFICATION
export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (id: string, thunkAPI) => {
    try {
      const notifRef = ref(db, `notifications/${id}`);
      await remove(notifRef);

      return { message: "Notification deleted successfully", id };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to delete notification");
    }
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    notifications: [] as any[],
    loading: false,
    error: null as string | null,
    successMessage: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch notifications";
      })

      // ADD
      .addCase(addNotification.pending, (state) => { state.loading = true; })
      .addCase(addNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.notifications.push(action.payload.notification); // Instant UI update
      })
      .addCase(addNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to add notification";
      })

      // UPDATE
      .addCase(updateNotification.pending, (state) => { state.loading = true; })
      .addCase(updateNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Update the specific item in the local state instantly
        const index = state.notifications.findIndex(n => n.id === action.payload.notification.id);
        if (index !== -1) {
          state.notifications[index] = { ...state.notifications[index], ...action.payload.notification };
        }
      })
      .addCase(updateNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to update notification";
      })

      // DELETE
      .addCase(deleteNotification.pending, (state) => { state.loading = true; })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.notifications = state.notifications.filter(n => n.id !== action.payload.id); // Instant UI update
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to delete notification";
      });
  }
});

export default notificationSlice.reducer;