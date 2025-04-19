// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkHmzW71pNQ0-IqzQRcbIn6JV6d97ro6k",
    authDomain: "white-board-e665d.firebaseapp.com",
    projectId: "white-board-e665d",
    storageBucket: "white-board-e665d.firebasestorage.app",
    messagingSenderId: "1084617519311",
    appId: "1:1084617519311:web:529c5ebdbbad5915a6c7ba",
    measurementId: "G-3NKLM6H40M"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const storage = firebase.storage();
const db = firebase.firestore();
const auth = firebase.auth(); // Add this line