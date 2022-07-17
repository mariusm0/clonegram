import React from "react";
import NewPostForm from "./Forms/NewPostForm";
import { createNewPost } from "../../FirebaseFunctions";

import "./NewPost.css";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const NewPost = () => {
  const user = useSelector((state) => state.user.uid);

  if (!user) {
    return <Navigate replace to="/login"></Navigate>;
  }
  const uploadPost = async (data) => {
    return await createNewPost(user, data);
  };
  return (
    <div className="new-post-container">
      <NewPostForm uploadPost={uploadPost} />
    </div>
  );
};

export default NewPost;
