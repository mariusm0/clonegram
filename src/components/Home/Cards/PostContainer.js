import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getUserInfo,
  likePost,
  unLikePost,
  checkIfUserLikedPost,
  getLikeCount,
} from "../../../FirebaseFunctions";

const PostContainer = ({ title, caption, imgUrl, timeStamp, userId, id }) => {
  const [username, setUsername] = useState("loading");
  const [isLiked, setIsLiked] = useState(null);
  const [postLikes, setPostLikes] = useState(0);
  useEffect(() => {
    handleUsername();
    handleLike();
  }, []);

  const handleUsername = async () => {
    const userInfo = await getUserInfo(userId);
    setUsername(userInfo.username);
  };

  const handleLike = async () => {
    const postLikes = await getLikeCount(id);
    if (postLikes !== "error" && postLikes) {
      setPostLikes(postLikes);
    }

    const userLiked = await checkIfUserLikedPost(id);
    if (userLiked === "error") {
      return;
    }
    setIsLiked(!!userLiked);
  };

  const onLikeClicked = async () => {
    if (isLiked === null) {
      return;
    }
    const result = await likePost(id);
    if (result === "error") {
      return;
    }
    setIsLiked(true);
    setPostLikes(postLikes + 1);
  };

  const onUnlikeClicked = async () => {
    if (isLiked === null) {
      return;
    }
    const result = await unLikePost(id);
    if (result === "error") {
      return;
    }
    setIsLiked(false);
    setPostLikes(postLikes - 1);
  };

  return (
    <div className="post-view">
      <Link to={`/clonegram/user/${userId}`} className="post-user">
        @{username}
      </Link>
      <div className="title">
        {title} <span className="time-stamp">{timeStamp}</span>
      </div>
      <img src={imgUrl} alt="post" className="post-image"></img>
      {isLiked ? (
        <button className="like-btn liked-btn" onClick={onUnlikeClicked}>
          ❤️<span className="like-info">{postLikes}</span>
        </button>
      ) : (
        <button className="like-btn" onClick={onLikeClicked}>
          🤍<span className="like-info">{postLikes}</span>
        </button>
      )}

      <div className="caption">{caption}</div>
    </div>
  );
};

export default PostContainer;
