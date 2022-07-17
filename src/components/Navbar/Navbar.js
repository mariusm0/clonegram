import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { userLoggedOut } from "../../features/user/userSlice";
import { signOut } from "firebase/auth";
import { auth } from "../../App";

const Navbar = () => {
  const user = useSelector((state) => state.user.user);

  const dispatch = useDispatch();
  const logoutUser = () => {
    signOut(auth)
      .then(() => {
        dispatch(userLoggedOut());
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // if user is logged show option to logout else show options to login in
  const renderedListItems = user ? (
    <>
      <li className="nav-link">
        <Link to="/clonegram/profile">@{user}</Link>
      </li>
      <li className="nav-link">
        <Link to="#" onClick={logoutUser}>
          Logout
        </Link>
      </li>
    </>
  ) : (
    <>
      <li className="nav-link">
        <Link to="/clonegram/login">Login</Link>
      </li>
      <li className="nav-link">
        <Link to="/clonegram/register">Register</Link>
      </li>
    </>
  );

  return (
    <nav>
      <Link className="nav-header" to="/clonegram">
        Clonegram
      </Link>
      <ul className="nav-links">{renderedListItems}</ul>
    </nav>
  );
};

export default Navbar;
