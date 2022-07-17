import React from "react";
import { Link } from "react-router-dom";

const FollowersList = ({ followers, following }) => {
  if (!followers || !following) {
    return null;
  }
  return (
    <div className="followers-container">
      <div>
        <div className="follow-header">Followers</div>
        <div className="follow-list">
          {followers.map((user, index) => {
            const { username, timeStamp } = user.data();
            return (
              <Link
                to={`/clonegram/user/${user.id}`}
                className="follow-user"
                key={index}
              >
                @{username}{" "}
                <span>Since {timeStamp.toDate().toLocaleDateString()}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div>
        <div className="follow-header">Following</div>
        <div className="follow-list">
          {following.map((user, index) => {
            const { username, timeStamp } = user.data();
            return (
              <Link
                to={`/clonegram/user/${user.id}`}
                className="follow-user"
                key={index}
              >
                @{username}{" "}
                <span>Since {timeStamp.toDate().toLocaleDateString()}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FollowersList;
