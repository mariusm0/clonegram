import React from "react";

import { query, where, collection, getDocs, limit } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, store } from "../../App";

import { userLoggedIn } from "../../features/user/userSlice";
import { useDispatch, useSelector } from "react-redux";

import "./Register.css";
import LoginForm from "./Forms/LoginForm";
import { Navigate } from "react-router-dom";

const Login = () => {
  const isLoggedIn = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const loginUser = async (userCreds) => {
    const { email, password } = userCreds;
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredentials) => {
        const uid = userCredentials.user.uid;
        const userRef = query(
          collection(store, "users"),
          where("uid", "==", uid),
          limit(1)
        );
        const userDoc = await getDocs(userRef);
        // get the first matching result
        const userInfo = userDoc.docs[0]?.data();
        if (!userInfo) {
          console.log("User info not found");
          return "User info not found";
        }
        dispatch(
          userLoggedIn({
            user: userInfo.username,
            userId: userInfo.uid,
            description: userInfo.description,
            dateOfBirth: userInfo.dateOfBirth,
          })
        );
      })
      .catch((error) => {
        console.log(error);
        return error.code;
      });
  };

  if (isLoggedIn) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <p className="header">Login</p>
        <LoginForm loginUser={loginUser} />
      </div>
    </div>
  );
};

export default Login;
