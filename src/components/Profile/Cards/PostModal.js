import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  getPostInfo,
  updatePost,
  deletePost,
} from "../../../FirebaseFunctions";
import LoadingFormIndicator from "../../Register/Forms/LoadingFormIndicator";

const PostModal = ({ id, onCloseClicked, isAuthor }) => {
  const [postInfo, setPostInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(null);
  const [updatedCaption, setUpdatedCaption] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    handlePostInfo();
  }, []);

  useLockBodyScroll();

  const handlePostInfo = async () => {
    const postSnap = await getPostInfo(id);
    if (postSnap === "error") {
      return;
    }

    setPostInfo({
      title: postSnap.postTitle,
      imgUrl: postSnap.postImage,
      caption: postSnap.postCaption,
      timeStamp: postSnap.timeStamp,
    });
  };

  const updatePostInfo = async () => {
    if (!updatedTitle) {
      return;
    }
    return await updatePost(id, updatedTitle, updatedCaption);
  };

  const onDeleteClicked = async () => {
    setIsUpdating(true);
    const result = await deletePost(id);
    if (result === "error") {
      setIsUpdating(false);
      return;
    }
    // run onClose Clicked with the reRender parameter set to true;
    onCloseClicked(true);
  };

  const handleEditMode = async (e) => {
    if (isEditing) {
      setIsUpdating(true);
      const result = await updatePostInfo();
      if (result === "error") {
        setIsUpdating(false);
        return;
      }
      setPostInfo({
        ...postInfo,
        title: updatedTitle,
        caption: updatedCaption,
      });
      setUpdatedTitle(null);
      setUpdatedCaption(null);
      setIsUpdating(false);
    } else {
      setUpdatedTitle(postInfo.title);
      setUpdatedCaption(postInfo.caption);
    }
    setIsEditing(!isEditing);
    e.target.disabled = false;
  };
  const updateTitleValue = (e) => setUpdatedTitle(e.target.value);
  const updateCaptionValue = (e) => setUpdatedCaption(e.target.value);

  return (
    <div className="post-modal">
      <div className="post-container">
        {!postInfo ? (
          <LoadingFormIndicator />
        ) : (
          <>
            <button className="close-modal" onClick={onCloseClicked}>
              Close
            </button>
            {isEditing ? (
              <input
                onChange={updateTitleValue}
                type="text"
                value={updatedTitle}
              ></input>
            ) : (
              <div className="top-field">
                <div className="title">{postInfo.title}</div>
                <div className="time-stamp">{postInfo.timeStamp}</div>
              </div>
            )}
            <img
              className="img-container"
              src={postInfo.imgUrl}
              alt="post"
            ></img>
            {isEditing ? (
              <textarea
                onChange={updateCaptionValue}
                value={updatedCaption}
              ></textarea>
            ) : (
              <div className="caption">{postInfo.caption}</div>
            )}
            {isAuthor &&
              (isUpdating ? (
                <LoadingFormIndicator />
              ) : (
                <div>
                  <button className="submit-btn" onClick={handleEditMode}>
                    Update
                  </button>
                  <button
                    className="submit-btn delete-btn"
                    onClick={onDeleteClicked}
                  >
                    Delete
                  </button>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

const useLockBodyScroll = () => {
  useLayoutEffect(() => {
    // Get original body overflow
    window.scrollTo(0, 0);
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent scrolling on mount
    document.body.style.overflow = "hidden";
    // Re-enable scrolling when component unmounts
    return () => (document.body.style.overflow = originalStyle);
  }, []); // Empty array ensures effect is only run on mount and unmount
};

export default PostModal;
