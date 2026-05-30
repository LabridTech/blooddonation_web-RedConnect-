import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, get, update } from "firebase/database";
import { auth, db } from "../firebaseConfig"; // Import from your config

// SSR Safe LocalStorage helpers
const getLocalStorage = (key: string) => typeof window !== "undefined" ? localStorage.getItem(key) : null;
const setLocalStorage = (key: string, value: string) => { if (typeof window !== "undefined") localStorage.setItem(key, value); };
const removeLocalStorage = (key: string) => { if (typeof window !== "undefined") localStorage.removeItem(key); };

interface User {
  uid: string; // Added UID (Crucial for Firebase)
  name: string;
  email: string;
  role: 'bank' | 'donor' | 'patient';
  available: boolean | number;
  lastDonation?: string | null;
  totalDonations?: number;
  bloodType?: string;
  phone?: string;
  age?: number;
  address?: string;
  city?: string;
  country?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialUser = getLocalStorage("user");
const initialToken = getLocalStorage("token");

const initialState: AuthState = {
  user: initialUser ? JSON.parse(initialUser) : null,
  token: initialToken,
  loading: false,
  error: null,
};

// --- REGISTER ---
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: any, thunkAPI) => {
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      // 2. Prepare profile data for Realtime Database (Exclude password!)
      const userProfile: User = {
        uid: firebaseUser.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        available: userData.available ?? true,
        bloodType: userData.bloodType || "",
        phone: userData.phone || "",
        age: userData.age || 0,
        address: userData.address || "",
        city: userData.city || "",
        country: userData.country || "",
        lastDonation: null,
        totalDonations: 0,
      };

      // 3. Save profile to Realtime Database under users/{uid}
      await set(ref(db, `users/${firebaseUser.uid}`), userProfile);

      // 4. Save to local storage & return payload
      setLocalStorage("user", JSON.stringify(userProfile));
      setLocalStorage("token", token);
      return { user: userProfile, token };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Registration failed");
    }
  }
);

// --- LOGIN ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData: any, thunkAPI) => {
    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;
      const token = await firebaseUser.getIdToken();

      // 2. Fetch user profile from Realtime Database
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userProfile = snapshot.val();
        setLocalStorage("user", JSON.stringify(userProfile));
        setLocalStorage("token", token);
        return { user: userProfile, token };
      } else {
        throw new Error("User data not found in database");
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Login failed");
    }
  }
);

// --- AUTO LOGIN ---
export const autoLogin = createAsyncThunk("auth/autoLogin", async (_, thunkAPI) => {
  try {
    // Check Firebase Auth state persistence
    const firebaseUser = await new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      }, reject);
    });

    if (firebaseUser) {
      const token = await (firebaseUser as any).getIdToken();
      const userRef = ref(db, `users/${(firebaseUser as any).uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userProfile = snapshot.val();
        setLocalStorage("user", JSON.stringify(userProfile));
        setLocalStorage("token", token);
        return { user: userProfile, token };
      }
    }
    return thunkAPI.rejectWithValue("No user found");
  } catch (error) {
    return thunkAPI.rejectWithValue("Failed to load user data");
  }
});

// --- LOGOUT ---
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    await signOut(auth);
    removeLocalStorage("user");
    removeLocalStorage("token");
    return null;
  } catch (error) {
    return thunkAPI.rejectWithValue("Logout failed");
  }
});

// --- UPDATE AVAILABILITY ---
export const updateAvailable = createAsyncThunk(
  "auth/updateAvailable",
  async (userData: { available: boolean }, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const uid = state.auth.user?.uid;
      if (!uid) throw new Error("Not authenticated");

      // Update in Firebase RTDB
      await update(ref(db, `users/${uid}`), { available: userData.available });

      // Update Local Storage
      const currentUser = getLocalStorage("user");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        parsed.available = userData.available;
        setLocalStorage("user", JSON.stringify(parsed));
      }
      return { available: userData.available };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to update availability");
    }
  }
);

// --- UPDATE LAST DONATION ---
export const updateLastDonation = createAsyncThunk(
  "auth/updateLastDonation",
  async (userData: { lastDonation: string }, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const uid = state.auth.user?.uid;
      if (!uid) throw new Error("Not authenticated");

      await update(ref(db, `users/${uid}`), { lastDonation: userData.lastDonation });

      const currentUser = getLocalStorage("user");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        parsed.lastDonation = userData.lastDonation;
        setLocalStorage("user", JSON.stringify(parsed));
      }
      return { lastDonation: userData.lastDonation };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to update last donation");
    }
  }
);

// --- UPDATE TOTAL DONATIONS ---
export const updateTotalDonations = createAsyncThunk(
  "auth/updateTotalDonations",
  async (userData: { totalDonations: number }, thunkAPI) => {
    try {
      const state: any = thunkAPI.getState();
      const uid = state.auth.user?.uid;
      if (!uid) throw new Error("Not authenticated");

      await update(ref(db, `users/${uid}`), { totalDonations: userData.totalDonations });

      const currentUser = getLocalStorage("user");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        parsed.totalDonations = userData.totalDonations;
        setLocalStorage("user", JSON.stringify(parsed));
      }
      return { totalDonations: userData.totalDonations };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Failed to update total donations");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Registration failed";
      })
      // Login
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Login failed";
      })
      // Auto Login
      .addCase(autoLogin.pending, (state) => { state.loading = true; })
      .addCase(autoLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(autoLogin.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      })
      // Update Availability
      .addCase(updateAvailable.fulfilled, (state, action) => {
        if (state.user) state.user.available = action.payload.available;
      })
      // Update Last Donation
      .addCase(updateLastDonation.fulfilled, (state, action) => {
        if (state.user) state.user.lastDonation = action.payload.lastDonation;
      })
      // Update Total Donations
      .addCase(updateTotalDonations.fulfilled, (state, action) => {
        if (state.user) state.user.totalDonations = action.payload.totalDonations;
      });
  },
});

export default authSlice.reducer;