// ============================================
// FIREBASE CONFIGURATION
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyAT7zx5Jwr7X_HDQJBr-VpA4yoyjR8wFO8",
  authDomain: "myfarmagro.firebaseapp.com",
  projectId: "myfarmagro",
  storageBucket: "myfarmagro.firebasestorage.app",
  messagingSenderId: "1065501710757",
  appId: "1:1065501710757:web:f99c957dcef17d5663f04c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Set persistence to LOCAL so users stay logged in
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);