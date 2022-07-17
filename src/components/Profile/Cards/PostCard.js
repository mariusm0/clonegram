import React from "react";

const PostCard = ({ title, imgUrl, onClicked }) => {
  return (
    <div className="post-card" onClick={onClicked}>
      <img src={imgUrl} alt="post" className="post-card-image"></img>
      <div className="post-card-title">{title}</div>
    </div>
  );
};

export default PostCard;
