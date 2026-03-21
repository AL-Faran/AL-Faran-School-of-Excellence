// js/firebase-config.js

// TODO: Replace the following configuration with your actual Firebase Project config
// 1. Go to Firebase Console -> Project Settings -> General -> Web Apps
// 2. Copy the firebaseConfig object and replace the one below.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase (Using Firebase v8 Compat scripts which are loaded via CDN in HTML)
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: Enable offline persistence for Firestore
db.enablePersistence()
    .catch((err) => {
        console.warn("Firestore offline persistence failed: ", err.code);
    });
