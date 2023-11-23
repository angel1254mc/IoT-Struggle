"use client"
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmoJ66G3mH61Pv2Spn-ypNHQOgS-Oe6bg",
  authDomain: "iotstruggle.firebaseapp.com",
  databaseURL: "https://iotstruggle-default-rtdb.firebaseio.com",
  projectId: "iotstruggle",
  storageBucket: "iotstruggle.appspot.com",
  messagingSenderId: "81579355665",
  appId: "1:81579355665:web:5705836824bf1844074bb0",
  measurementId: "G-MLJT3MDZXR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
