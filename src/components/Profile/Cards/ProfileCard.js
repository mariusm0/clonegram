import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import {
  collection,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { store } from "../../../App";

import {
  uploadDisplayPicture,
  checkIfUsernameTaken,
  getUserInfo,
  getFollowInfo,
} from "../../../FirebaseFunctions";
import LoadingFormIndicator from "../../Register/Forms/LoadingFormIndicator";
import { userUpdated } from "../../../features/user/userSlice";
import { getDownloadURL } from "firebase/storage";

const ProfileCard = ({ toggleFollowerView }) => {
  const userInfo = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [displayPicUrl, setDisplayPicUrl] = useState("");
  const [followInfo, setFollowInfo] = useState({});
  const dispatch = useDispatch();

  const { user, uid, description, dateOfBirth } = userInfo;

  useEffect(() => {
    handleUserInfo();
  });

  const toggleCardStatus = () => setIsEditing(!isEditing);

  const handleUserInfo = async () => {
    const userData = await getUserInfo(uid);
    const followData = await getFollowInfo(userData.uid);
    setDisplayPicUrl(userData.displayPic);
    setFollowInfo(followData);
  };

  const updateUserProfile = async (newUserInfo) => {
    const { username, dateOfBirth, description, displayPicture } = newUserInfo;

    // if the user has changed his username, then check if the username is taken by someone else
    if (username !== userInfo.user) {
      const isUsernameTaken = await checkIfUsernameTaken(username);
      if (isUsernameTaken) {
        return "username taken";
      }
    }

    const userQuery = query(
      collection(store, "users"),
      where("uid", "==", uid),
      limit(1)
    );

    const userDoc = await getDocs(userQuery);
    const userRefId = userDoc.docs[0]?.id;
    if (!userRefId) {
      console.log("User info not found");
      return;
    }

    const userRef = doc(store, "users", userRefId);

    if (displayPicture[0]) {
      const dpSnapshot = await uploadDisplayPicture(displayPicture[0], uid);
      const downloadUrl = await getDownloadURL(dpSnapshot.ref);
      await updateDoc(userRef, {
        username,
        dateOfBirth,
        description,
        displayPic: downloadUrl,
      });
      setDisplayPicUrl(displayPicUrl);
    } else {
      await updateDoc(userRef, {
        username,
        dateOfBirth,
        description,
      });
    }

    dispatch(userUpdated({ username, description, dateOfBirth }));
    toggleCardStatus();
  };

  const childComponentProps = {
    username: user,
    description,
    dateOfBirth,
    displayPic: displayPicUrl,
  };

  if (isEditing) {
    return (
      <UpdateProfileForm
        {...childComponentProps}
        onUpdate={updateUserProfile}
        toggleCardStatus={toggleCardStatus}
      />
    );
  }

  return (
    <div className="profile-card">
      <ProfileView
        {...childComponentProps}
        onUpdateClicked={toggleCardStatus}
        followInfo={followInfo}
        toggleFollowerView={toggleFollowerView}
      />
    </div>
  );
};

const ProfileView = ({
  username,
  displayPic,
  description,
  dateOfBirth,
  onUpdateClicked,
  followInfo,
  toggleFollowerView,
}) => {
  return (
    <>
      {displayPic ? (
        <img src={displayPic} alt="display-pic" className="display-pic"></img>
      ) : (
        <div className="no-dp">No Display Picture Uploaded</div>
      )}
      <div className="text-info">
        <p className="username">
          {username}{" "}
          <button className="update-btn" onClick={onUpdateClicked}>
            Edit Profile
          </button>
        </p>
        <p className="date-of-birth">{dateOfBirth}</p>
        <p className="description">{description}</p>
        <div className="followers">
          Followers: {followInfo.followers?.length || 0}
        </div>
        <div className="following">
          Following: {followInfo.following?.length || 0}
        </div>
        <button className="update-btn" onClick={toggleFollowerView}>
          View List
        </button>
      </div>
    </>
  );
};

const UpdateProfileForm = ({
  username,
  description,
  dateOfBirth,
  onUpdate,
  toggleCardStatus,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      username,
      description,
      dateOfBirth,
    },
  });

  const [customError, setCustomError] = useState(null);
  const [formStatus, setFormStatus] = useState("idle");

  const onSubmit = async (data) => {
    setFormStatus("loading");
    const result = await onUpdate(data);
    if (result === "username taken") {
      setCustomError("Username Taken");
    }
    setFormStatus("idle");
  };

  const error = errors[Object.keys(errors)[0]]?.message || customError;

  return (
    <form className="form-card-profile" onSubmit={handleSubmit(onSubmit)}>
      <div className="input-field display-pic-field">
        <label htmlFor="display-pic">Display Picture: </label>
        <input
          type="file"
          id="display-pic"
          accept="image/*"
          {...register("displayPicture")}
        ></input>
      </div>

      <div className="text-fields">
        <div className="custom-error-field">{error}</div>
        <div className="input-field">
          <label htmlFor="username">Username: </label>
          <input
            type="text"
            id="username"
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
          <label htmlFor="date-of-birth">Date Of Birth: </label>
          <input
            type="date"
            id="date-of-birth"
            {...register("dateOfBirth", {
              required: "Date Of Birth Is Required",
            })}
          ></input>
        </div>
      </div>

      <div className="text-field">
        <div className="input-field">
          <label htmlFor="description">Description:</label>
          <textarea id="description" {...register("description")}></textarea>
        </div>
      </div>

      {formStatus === "idle" ? (
        <div className="button-div">
          <button className="update-btn">Update Profile</button>
          <button
            type="button"
            className="update-btn"
            onClick={toggleCardStatus}
          >
            Cancel
          </button>
        </div>
      ) : (
        <LoadingFormIndicator />
      )}
    </form>
  );
};

export default ProfileCard;
