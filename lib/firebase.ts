// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQ9SC0W-yas-h4Q7woMeDzQenBFvfhFnY",
  authDomain: "invetory-manager-67f2c.firebaseapp.com",
  projectId: "invetory-manager-67f2c",
  storageBucket: "invetory-manager-67f2c.appspot.com",
  messagingSenderId: "302603029503",
  appId: "1:302603029503:web:427170e94d9c6c899935ca",
  measurementId: "G-L90EYBSRZN",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
