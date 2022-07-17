import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";

import LoadingFormIndicator from "../../Register/Forms/LoadingFormIndicator";

const NewPostForm = ({ uploadPost }) => {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm();

  const [customError, setCustomError] = useState(null);

  const [currentFormState, setCurrentFormState] = useState("idle");

  const onSubmit = async (data) => {
    setCurrentFormState("loading");
    const result = await uploadPost(data);
    if (result === "error") {
      setCustomError("An Error Has Occured");
      setCurrentFormState("idle");
      return;
    }
    setCurrentFormState("redirect");
  };

  const error = errors[Object.keys(errors)[0]]?.message;
  if (error && customError) {
    setCustomError(null);
  }

  if (currentFormState === "redirect") {
    return <Navigate replace to="/profile"></Navigate>;
  }

  return (
    <form className="new-post-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="input-field image-field">
        <label htmlFor="post-image">Post: </label>
        <input
          type="file"
          id="post-image"
          accept="image/*"
          {...register("postImage", { required: "Image Is Required" })}
        ></input>
      </div>
      <div className="input-field">
        <label htmlFor="post-title">Title: </label>
        <input
          type="text"
          id="post-title"
          {...register("postTitle", {
            required: "Title Is Required",
          })}
        ></input>
      </div>
      <div className="input-field">
        <label htmlFor="post-caption">Caption: </label>
        <textarea id="post-caption" {...register("postCaption")}></textarea>
      </div>
      <p className="error-field">{error || customError}</p>
      {currentFormState === "idle" ? (
        <button className="submit-btn">Post</button>
      ) : (
        <LoadingFormIndicator />
      )}
    </form>
  );
};

export default NewPostForm;
