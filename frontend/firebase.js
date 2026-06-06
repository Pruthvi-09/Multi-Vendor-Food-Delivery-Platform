// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "quickbite-food-delivery-417ad.firebaseapp.com",
  projectId: "quickbite-food-delivery-417ad",
  storageBucket: "quickbite-food-delivery-417ad.firebasestorage.app",
  messagingSenderId: "427004531510",
  appId: "1:427004531510:web:36332d1c1c225bcad19997"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 export const auth=getAuth(app)

