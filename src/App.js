import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { initializeApp } from "firebase/app";

import Navbar from "./components/Navbar/Navbar";
import Register from "./components/Register/Register";
import Login from "./components/Register/Login";
import Profile from "./components/Profile/Profile";
import HomePage from "./components/Home/HomePage";
import NewPost from "./components/NewPost/NewPost";
import UserPage from "./components/UserPage/UserPage";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { userLoggedOut } from "./features/user/userSlice";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSieWCEMtVfdXjD8j0LvFllv5G3KgrApo",
  authDomain: "clom-c8a86.firebaseapp.com",
  projectId: "clom-c8a86",
  storageBucket: "clom-c8a86.appspot.com",
  messagingSenderId: "275927124881",
  appId: "1:275927124881:web:e65a7e1eeacd2a13936830",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const store = getFirestore(app);
const storage = getStorage(app);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    userLoggedOut();
  }
});

function App() {
  return (
    <BrowserRouter>
      <Navbar isLoggedIn={false} />
      <Routes>
        <Route path="clonegram" element={<HomePage />}></Route>
        <Route path="/clonegram/login" element={<Login />}></Route>
        <Route path="/clonegram/register" element={<Register />}></Route>
        <Route path="/clonegram/profile" element={<Profile />}></Route>
        <Route path="/clonegram/new-post" element={<NewPost />}></Route>
        <Route path="/clonegram/user/:userId" element={<UserPage />}></Route>
        <Route path="*" element={<Navigate replace to="clonegram" />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export { auth, store, storage };

export default App;
