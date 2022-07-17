import React, { useState } from "react";
import { useForm } from "react-hook-form";
import LoadingFormIndicator from "./LoadingFormIndicator";

const LoginForm = ({ loginUser }) => {
  const [currentFormState, setCurrentFormState] = useState("idle");
  const [customError, setCustomError] = useState(null);
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = (data) => {
    setCurrentFormState("loading");
    loginUser(data).then((result) => {
      if (result === "auth/user-not-found") {
        setCustomError("Invalid Email/Password");
        setCurrentFormState("idle");
        return;
      } else if (result === "auth/wrong-password") {
        setCustomError("Wrong Password");
        setCurrentFormState("idle");
        return;
      }
      setCustomError(null);
      setCurrentFormState("idle");
    });
  };

  const error = errors[Object.keys(errors)[0]]?.message;
  if (error && customError) {
    setCustomError(null);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="input-field">
        <label htmlFor="email">Email: </label>
        <input
          type="text"
          id="email"
          placeholder="example@domain.com"
          {...register("email", {
            required: "Email Is Required",
            pattern: {
              value:
                /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
              message: "Invalid Email Format",
            },
          })}
        ></input>
      </div>

      <div className="input-field">
        <label htmlFor="password">Password: </label>
        <input
          type="password"
          id="password"
          placeholder="Enter Your Password"
          {...register("password", { required: "Password Is Required" })}
        ></input>
      </div>

      <p className="error-field">{error || customError}</p>

      {currentFormState === "idle" ? (
        <button className="submit-btn">Login</button>
      ) : (
        <LoadingFormIndicator />
      )}
    </form>
  );
};

export default LoginForm;
