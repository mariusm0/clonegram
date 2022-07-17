import React, { useState } from "react";
import "./Register.css";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  query,
  where,
  limit,
  getDocs,
} from "firebase/firestore";

import { auth, store } from "../../App";
import { userLoggedIn } from "../../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

import { Navigate } from "react-router-dom";

import UserProfileForm from "./Forms/UserProfileForm";
import RegisterForm from "./Forms/RegisterForm";

const Register = () => {
  const [accountCreated, setAccountCreated] = useState(false);
  const [uid, setUID] = useState(null);
  const isLoggedIn = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const onAccountCreated = (userCredentials) => {
    setAccountCreated(true);
    setUID(userCredentials.user.uid);
  };

  const createUserAccount = async (data) => {
    const { email, password } = data;
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        onAccountCreated(userCredentials);
      })
      .catch((error) => {
        console.log(error);
        return error.code;
      });
  };

  const createUserProfile = async (userData) => {
    if (!uid) {
      console.log("No UID Found");
      return;
    }
    const { username, dateOfBirth, description = "" } = userData;

    const existingUser = query(
      collection(store, "users"),
      where("username", "==", username),
      limit(1)
    );
    const userExists = await getDocs(existingUser);
    // Checking whether a user already exists with that username
    if (userExists.docs.length > 0) {
      return Promise.resolve("User Already Exists");
    }

    return addDoc(collection(store, "users"), {
      uid,
      username,
      dateOfBirth,
      description,
    })
      .then(() => {
        dispatch(
          userLoggedIn({
            user: username,
            userId: uid,
            description,
            dateOfBirth,
          })
        );
      })
      .catch((error) => {
        console.log(error);
        return "An Error Has Occured";
      });
  };

  // If/When the user is logged in redirect to the homepage
  if (isLoggedIn) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <p className="header">Register</p>

        {!accountCreated ? (
          <RegisterForm createAccount={createUserAccount} />
        ) : (
          <UserProfileForm createUserProfile={createUserProfile} />
        )}
      </div>
    </div>
  );
};

export default Register;
