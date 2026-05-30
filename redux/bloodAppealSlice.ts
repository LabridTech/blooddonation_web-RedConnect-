import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, push, set } from 'firebase/database';
import { db } from '../firebaseConfig'; // Import your Firebase DB instance

// FETCH BLOOD APPEALS
export const fetchBloodAppeals = createAsyncThunk(
  "bloodAppeal/fetchAppeals",
  async (_, thunkAPI) => {
    try {
      const appealsRef = ref(db, 'appeals');
      const snapshot = await get(appealsRef);

      if (snapshot.exists()) {
        const appealsObject = snapshot.val();
        // Firebase stores lists as objects. Convert to an array and keep the Firebase push ID.
        const appealsArray = Object.keys(appealsObject).map(key => ({
          id: key,
          ...appealsObject[key]
        }));
        return appealsArray;
      } else {
        // No appeals found in database
        return [];
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch blood appeals");
    }
  }
);

// ADD BLOOD APPEAL
export const addBloodAppeal = createAsyncThunk(
  "bloodAppeal/addAppeal",
  async (appealData: any, thunkAPI) => {
    try {
      // 1. Create a new reference with a unique auto-generated key
      const newAppealRef = push(ref(db, 'appeals'));

      // 2. Save the data to that reference
      await set(newAppealRef, appealData);

      // 3. Return the data in the same format your original reducer expected
      return {
        message: "Blood appeal submitted successfully",
        appeal: { id: newAppealRef.key, ...appealData }
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to submit blood appeal");
    }
  }
);

const bloodAppealSlice = createSlice({
  name: "bloodAppeal",
  initialState: {
    appeals: [] as any[],
    loading: false,
    error: null as string | null,
    successMessage: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH APPEALS
      .addCase(fetchBloodAppeals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBloodAppeals.fulfilled, (state, action) => {
        state.loading = false;
        state.appeals = action.payload; // The payload is now a formatted array
      })
      .addCase(fetchBloodAppeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch blood appeals";
      })

      // ADD APPEAL
      .addCase(addBloodAppeal.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addBloodAppeal.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.appeals.push(action.payload.appeal); // Push the new appeal with its Firebase ID
      })
      .addCase(addBloodAppeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to submit blood appeal";
      });
  }
});

export default bloodAppealSlice.reducer;