import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, push } from 'firebase/database';
import { db } from '../firebaseConfig'; // Import your Firebase DB instance

// FETCH DONATED BLOOD LOGS
export const fetchBloodDonated = createAsyncThunk(
  "bloodDonated/fetchAll",
  async (_, thunkAPI) => {
    try {
      const donatedRef = ref(db, 'donated');
      const snapshot = await get(donatedRef);

      if (snapshot.exists()) {
        const donatedObject = snapshot.val();
        // Convert Firebase object to an array and attach the Firebase unique ID
        const donatedArray = Object.keys(donatedObject).map(key => ({
          id: key,
          ...donatedObject[key]
        }));
        return donatedArray;
      } else {
        return []; // Return empty array if no donations exist
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch donation logs");
    }
  }
);

// ADD DONATED BLOOD LOG
export const addBloodDonated = createAsyncThunk(
  "bloodDonated/add",
  async (donationData: any, thunkAPI) => {
    try {
      const donatedRef = ref(db, 'donated');
      // push() generates a unique key and saves the data simultaneously
      const newDonationRef = await push(donatedRef, donationData);

      return {
        message: "Donation logged successfully",
        donation: { id: newDonationRef.key, ...donationData }
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to log donation");
    }
  }
);

const bloodDonatedSlice = createSlice({
  name: "bloodDonated",
  initialState: {
    donations: [] as any[],
    loading: false,
    error: null as string | null,
    successMessage: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchBloodDonated.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBloodDonated.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload;
      })
      .addCase(fetchBloodDonated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch donation logs";
      })

      // ADD
      .addCase(addBloodDonated.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addBloodDonated.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Optional: Push the new donation to the array so UI updates instantly 
        // without needing to re-fetch from the database
        state.donations.push(action.payload.donation);
      })
      .addCase(addBloodDonated.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to log donation";
      });
  }
});

export default bloodDonatedSlice.reducer;