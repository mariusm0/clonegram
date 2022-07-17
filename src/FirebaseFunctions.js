import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage, store } from "./App";
import { store as reduxStore } from "./app/store";
import {
  collection,
  where,
  limit,
  query,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  setDoc,
  deleteDoc,
  startAfter,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const convertTimeStamp = (post) => {
  return (
    post.timeStamp.toDate().toDateString() +
    " " +
    post.timeStamp.toDate().toLocaleTimeString()
  );
};

const getSignedInUser = () => reduxStore.getState().user;

const uploadDisplayPicture = async (picture, uid) => {
  try {
    const userStorageRef = ref(storage, uid);
    const displayPicRef = ref(userStorageRef, "displayPic");
    return await uploadBytes(displayPicRef, picture);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const checkIfUsernameTaken = async (username) => {
  const usernameQuery = query(
    collection(store, "users"),
    where("username", "==", username),
    limit(1)
  );

  const usernameQueryResults = await getDocs(usernameQuery);
  return !!usernameQueryResults.docs[0];
};

const getUserInfo = async (uid) => {
  try {
    const userQuery = query(
      collection(store, "users"),
      where("uid", "==", uid),
      limit(1)
    );

    const userDocs = await getDocs(userQuery);
    return { ...userDocs.docs[0].data(), refId: userDocs.docs[0].id };
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const createNewPost = async (uid, data) => {
  const { postTitle, postCaption, postImage } = data;

  if (!postImage) {
    return "error/no-image-found";
  }

  try {
    // creates a location in the format "<user_id>/posts/<unique_id>"
    const ImageLocation = `${uid}/posts/${uuidv4()}`;
    const ImageRef = ref(storage, ImageLocation);
    const ImageSnapshot = await uploadBytes(ImageRef, postImage[0]);
    const postImageUrl = await getDownloadURL(ImageSnapshot.ref);

    return await addDoc(collection(store, "posts"), {
      uid,
      postTitle,
      postCaption,
      timeStamp: serverTimestamp(),
      postImage: postImageUrl,
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getUsersPosts = async (uid) => {
  try {
    const postQuery = query(
      collection(store, "posts"),
      where("uid", "==", uid),
      limit(20),
      orderBy("timeStamp")
    );
    const postsSnap = await getDocs(postQuery);

    return postsSnap.docs.map((post) => {
      const timeStamp = convertTimeStamp(post.data());
      return { ...post.data(), id: post.id, timeStamp };
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getPostInfo = async (postRefId) => {
  try {
    const postRef = doc(store, "posts", postRefId);
    const postSnap = await getDoc(postRef);
    const timeStamp = convertTimeStamp(postSnap.data());
    return { ...postSnap.data(), timeStamp };
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const updatePost = async (postRefId, updatedTitle, updatedCaption) => {
  try {
    const postRef = doc(store, "posts", postRefId);
    return await updateDoc(postRef, {
      postTitle: updatedTitle,
      postCaption: updatedCaption,
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const deletePost = async (postRefId) => {
  const signedUser = getSignedInUser();
  if (!signedUser.user) {
    return "error";
  }
  try {
    const postRef = doc(store, "posts", postRefId);
    return await deleteDoc(postRef);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getLatestPosts = async (lastPost = null) => {
  try {
    let postQuery = query(
      collection(store, "posts"),
      orderBy("timeStamp", "desc"),
      limit(5)
    );
    if (lastPost) {
      postQuery = query(
        collection(store, "posts"),
        orderBy("timeStamp", "desc"),
        limit(5),
        startAfter(lastPost)
      );
    }
    const postsSnap = await getDocs(postQuery);
    const lastPostDoc = postsSnap.docs.at(-1);
    const postsList = postsSnap.docs.map((post) => {
      const timeStamp = convertTimeStamp(post.data());
      return { ...post.data(), id: post.id, timeStamp };
    });

    return { posts: postsList, lastDoc: lastPostDoc };
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getFollowersPosts = async (filter, lastPost = null) => {
  const signedUser = getSignedInUser();
  if (!signedUser.uid) {
    return "error";
  }
  try {
    const userInfo = await getUserInfo(signedUser.uid);
    const followersRef = collection(store, "users", userInfo.refId, filter);
    const followingUsersSnap = await getDocs(followersRef);
    const followersList = followingUsersSnap.docs.map((user) => user.id);
    if (!followersList.length) {
      return "error/no-followings";
    }
    let followersPostQuery = query(
      collection(store, "posts"),
      where("uid", "in", followersList),
      orderBy("timeStamp", "desc"),
      limit(5)
    );
    if (lastPost) {
      followersPostQuery = query(
        collection(store, "posts"),
        where("uid", "in", followersList),
        limit(5),
        orderBy("timeStamp", "desc"),
        startAfter(lastPost)
      );
    }
    const followersPostSnap = await getDocs(followersPostQuery);
    const lastDoc = followersPostSnap.docs.at(-1);
    const postList = followersPostSnap.docs.map((post) => {
      const timeStamp = convertTimeStamp(post.data());
      return { ...post.data(), timeStamp, id: post.id };
    });
    return { posts: postList, lastDoc };
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const addUserToFollowersList = async (signedUsersId, followingUsersId) => {
  try {
    const userSnap = await getUserInfo(signedUsersId);
    const followingUserSnap = await getDoc(
      doc(store, "users", followingUsersId)
    );
    const { username, uid } = followingUserSnap.data();
    const followingRef = doc(store, "users", userSnap.refId, "following", uid);
    return await setDoc(followingRef, {
      username: username,
      timeStamp: serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const removeUserFromFollowersList = async (signedUsersId, followingUsersId) => {
  try {
    const userSnap = await getUserInfo(signedUsersId);
    const followingUserSnap = await getDoc(
      doc(store, "users", followingUsersId)
    );
    const followingRef = doc(
      store,
      "users",
      userSnap.refId,
      "following",
      followingUserSnap.data().uid
    );
    return await deleteDoc(followingRef);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const followUser = async (signedUsersId, signedUsername, followingUsersId) => {
  if (signedUsersId === followingUsersId || !signedUsersId) {
    return "error";
  }
  try {
    const followRef = doc(
      store,
      "users",
      followingUsersId,
      "followers",
      signedUsersId
    );
    await addUserToFollowersList(signedUsersId, followingUsersId);
    return await setDoc(followRef, {
      username: signedUsername,
      timeStamp: serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const unfollowUser = async (signedUsersId, followingUsersId) => {
  try {
    const followRef = doc(
      store,
      "users",
      followingUsersId,
      "followers",
      signedUsersId
    );
    await removeUserFromFollowersList(signedUsersId, followingUsersId);
    return await deleteDoc(followRef);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const checkIfUserIsFollowing = async (signedUsersId, followingUsersId) => {
  try {
    const followRef = doc(
      store,
      "users",
      followingUsersId,
      "followers",
      signedUsersId
    );
    const docSnap = await getDoc(followRef);
    return docSnap.exists();
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getFollowInfo = async (userId) => {
  try {
    const userSnap = await getUserInfo(userId);
    const { refId } = userSnap;

    const followersRef = collection(store, "users", refId, "followers");
    const followersSnap = await getDocs(followersRef);

    const followingRef = collection(store, "users", refId, "following");
    const followingSnap = await getDocs(followingRef);
    return { followers: followersSnap.docs, following: followingSnap.docs };
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const likePost = async (postId) => {
  const signedUser = getSignedInUser();
  if (!signedUser?.uid) {
    return "error";
  }

  try {
    const likesRef = doc(store, "posts", postId, "likes", signedUser.uid);
    return await setDoc(likesRef, {
      timeStamp: serverTimestamp(),
    });
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const unLikePost = async (postId) => {
  const signedUser = getSignedInUser();
  if (!signedUser?.uid) {
    return "error";
  }

  try {
    const likesRef = doc(store, "posts", postId, "likes", signedUser.uid);
    return await deleteDoc(likesRef);
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const checkIfUserLikedPost = async (postId) => {
  const signedUser = getSignedInUser();
  if (!signedUser?.uid) {
    return "error";
  }

  try {
    const likesRef = doc(store, "posts", postId, "likes", signedUser.uid);
    const likeDoc = await getDoc(likesRef);
    return likeDoc.exists();
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getLikeCount = async (postId) => {
  try {
    const likesRef = collection(store, "posts", postId, "likes");
    const likesDocs = await getDocs(likesRef);
    return likesDocs.docs?.length;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

const getSimilarUsers = async (usernameChunk) => {
  try {
    // queries users whose username field starts with the usernameChunk
    const userQuery = query(
      collection(store, "users"),
      where("username", ">=", usernameChunk),
      limit(3)
    );
    const usersSnap = await getDocs(userQuery);
    if (!usersSnap.docs.length) {
      return "error";
    }
    const userList = usersSnap.docs.map((user) => {
      const { uid, username } = user.data();
      return {
        uid,
        username,
      };
    });

    return userList.filter((user) => user.username.startsWith(usernameChunk));
  } catch (error) {
    console.log(error);
    return "error";
  }
};

export {
  uploadDisplayPicture,
  checkIfUsernameTaken,
  getUserInfo,
  createNewPost,
  getUsersPosts,
  getPostInfo,
  updatePost,
  getLatestPosts,
  followUser,
  checkIfUserIsFollowing,
  unfollowUser,
  getFollowInfo,
  addUserToFollowersList,
  likePost,
  unLikePost,
  checkIfUserLikedPost,
  getLikeCount,
  getFollowersPosts,
  getSimilarUsers,
  deletePost,
};
