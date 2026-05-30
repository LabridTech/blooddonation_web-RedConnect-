import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, push } from 'firebase/database';
import { db } from '../firebaseConfig'; // Import your Firebase DB instance

// FETCH FEEDBACK
export const fetchFeedback = createAsyncThunk(
  "feedback/fetchAll",
  async (_, thunkAPI) => {
    try {
      const feedbackRef = ref(db, 'feedbacks');
      const snapshot = await get(feedbackRef);

      if (snapshot.exists()) {
        const feedbackObject = snapshot.val();
        // Convert Firebase object to an array and attach the Firebase unique ID
        const feedbackArray = Object.keys(feedbackObject).map(key => ({
          id: key,
          ...feedbackObject[key]
        }));
        return feedbackArray;
      } else {
        return []; // Return empty array if no feedback exists
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch feedback");
    }
  }
);

// ADD FEEDBACK
export const addFeedback = createAsyncThunk(
  "feedback/add",
  async (feedbackData: any, thunkAPI) => {
    try {
      const feedbackRef = ref(db, 'feedbacks');
      // push() generates a unique key and saves the data simultaneously
      const newFeedbackRef = await push(feedbackRef, feedbackData);

      return {
        message: "Feedback submitted successfully",
        feedback: { id: newFeedbackRef.key, ...feedbackData }
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to submit feedback");
    }
  }
);

const feedbackSlice = createSlice({
  name: "feedback",
  initialState: {
    feedbacks: [] as any[],
    loading: false,
    error: null as string | null,
    successMessage: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH CASES
      .addCase(fetchFeedback.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch feedback";
      })

      // ADD CASES
      .addCase(addFeedback.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Push the new feedback to the array so the UI updates instantly 
        // without needing to re-fetch from the database
        state.feedbacks.push(action.payload.feedback);
      })
      .addCase(addFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to submit feedback";
      });
  }
});

export default feedbackSlice.reducer;