import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getFollowInfo } from "../../FirebaseFunctions";
import FollowersList from "../UserPage/FollowersList";

import PostList from "./Cards/PostList";
import ProfileCard from "./Cards/ProfileCard";

import "./Profile.css";

const Profile = () => {
  const user = useSelector((state) => state.user);
  const [showFollowers, setShowFollowers] = useState(false);
  const [followerInfo, setFollowInfo] = useState({});

  useEffect(() => {
    handleFollowerData();
  }, []);

  const handleFollowerData = async () => {
    const followData = await getFollowInfo(user.uid);
    setFollowInfo(followData);
  };

  const toggleFollowerView = (e) => {
    if (showFollowers) {
      e.target.textContent = "View List";
      setShowFollowers(false);
    } else {
      e.target.textContent = "Close List";
      setShowFollowers(true);
    }
  };

  if (!user.user) {
    return <Navigate replace to="/login"></Navigate>;
  }
  return (
    <div className="profile-container">
      <ProfileCard toggleFollowerView={toggleFollowerView} />
      {showFollowers ? (
        <FollowersList
          followers={followerInfo.followers}
          following={followerInfo.following}
        />
      ) : (
        <div></div>
      )}
      <PostList />
    </div>
  );
};

export default Profile;
