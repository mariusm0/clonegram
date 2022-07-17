import React, { createRef, useState } from "react";
import { useForm } from "react-hook-form";

import LoadingFormIndicator from "./LoadingFormIndicator";

const UserProfileForm = ({ createUserProfile }) => {
  const createBtn = createRef();
  const [currentFormState, setCurrentFormState] = useState("idle");
  const [customError, setCustomError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setCurrentFormState("loading");
    createUserProfile(data)
      .then((result) => {
        if (result === "User Already Exists") {
          setCustomError("Username Taken");
        } else if (result === "An Error Has Occured") {
          setCustomError(result);
        }
        setCurrentFormState("idle");
      })
      .catch((error) => {
        console.log(error);
        setCurrentFormState("idle");
      });
  };

  // remove the custom error if there are other errors
  const error = errors[Object.keys(errors)[0]]?.message;
  if (error && customError) {
    setCustomError(null);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="input-field">
        <label htmlFor="username">Username: </label>
        <input
          id="username"
          type="text"
          placeholder="bob123"
          {...register("username", {
            required: "Username Is Required",
            minLength: {
              value: "4",
              message: "Username Should be Atleast 4 Characters",
            },
            maxLength: {
              value: "20",
              message: "Username Should Be Less than 20 Characters",
            },
            pattern: {
              value: /^[a-zA-Z0-9-]+$/,
              message:
                "Username Should Only Contain Letters, Numbers and '-' Symbol",
            },
          })}
        ></input>
      </div>
      <div className="input-field">
        <label htmlFor="date">Date Of Birth: </label>
        <input
          type="date"
          {...register("dateOfBirth", {
            required: "Date Of Birth Is Required",
          })}
        ></input>
      </div>
      <div className="input-field">
        <label htmlFor="description">Description: </label>
        <textarea
          id="description"
          placeholder="Say Something About Yourself..."
          {...register("description")}
        ></textarea>
      </div>
      <p className="error-field">{error || customError}</p>
      {currentFormState === "idle" ? (
        <button className="submit-btn" ref={createBtn}>
          Create
        </button>
      ) : (
        <LoadingFormIndicator />
      )}
    </form>
  );
};

export default UserProfileForm;
