// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup

// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBL0n0BJsba-CEvYmyOVJ3aTHSntWXNx84",
    authDomain: "dls-digital-library-system.firebaseapp.com",
    projectId: "dls-digital-library-system",
    storageBucket: "dls-digital-library-system.firebasestorage.app",
    messagingSenderId: "316017046740",
    appId: "1:316017046740:web:ecdcfd5b8980901f4cf741",
    measurementId: "G-HY9T2WZJ5V"
  };


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();