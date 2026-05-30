import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ref, get, push } from 'firebase/database';
import { db } from '../firebaseConfig'; // Import your Firebase DB instance

// FETCH BLOOD REQUESTS
export const fetchBloodRequests = createAsyncThunk(
  "blood/fetchRequests",
  async (_, thunkAPI) => {
    try {
      const requestsRef = ref(db, 'bloodRequests');
      const snapshot = await get(requestsRef);

      if (snapshot.exists()) {
        const requestsObject = snapshot.val();
        // Convert Firebase object to an array and attach the Firebase unique ID
        const requestsArray = Object.keys(requestsObject).map(key => ({
          id: key,
          ...requestsObject[key]
        }));
        return requestsArray;
      } else {
        return []; // Return empty array if no requests exist
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to fetch blood requests");
    }
  }
);

// ADD BLOOD REQUEST
export const addBlood = createAsyncThunk(
  "blood/addBlood",
  async (bloodData: any, thunkAPI) => {
    try {
      const requestsRef = ref(db, 'bloodRequests');
      // push() generates a unique key and saves the data simultaneously
      const newRequestRef = await push(requestsRef, bloodData);

      return {
        message: "Blood request added successfully",
        request: { id: newRequestRef.key, ...bloodData }
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

const bloodSlice = createSlice({
  name: "blood",
  initialState: {
    requests: [] as any[],
    loading: false,
    error: null as string | null,
    successMessage: null as string | null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH CASES
      .addCase(fetchBloodRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBloodRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchBloodRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch blood requests";
      })

      // ADD CASES
      .addCase(addBlood.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addBlood.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Push the new request to the array so the UI updates instantly 
        // without needing to re-fetch from the database
        state.requests.push(action.payload.request);
      })
      .addCase(addBlood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to add blood";
      });
  }
});

export default bloodSlice.reducer;