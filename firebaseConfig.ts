// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAQkMtV0j9C57RxuXCGgxLM-roUqubBhgs",
    authDomain: "blood-4dee0.firebaseapp.com",
    databaseURL: "https://blood-4dee0-default-rtdb.firebaseio.com",
    projectId: "blood-4dee0",
    storageBucket: "blood-4dee0.firebasestorage.app",
    messagingSenderId: "610856606536",
    appId: "1:610856606536:web:8b4613e944a05d03de317d"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
