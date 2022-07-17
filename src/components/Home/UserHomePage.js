import React, { useEffect, useRef, useState } from "react";
import { getFollowersPosts, getLatestPosts } from "../../FirebaseFunctions";
import PostContainer from "./Cards/PostContainer";
import ReactLoading from "react-loading";

const UserHomePage = ({ filter, updateFilter }) => {
  const [posts, setPosts] = useState([]);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLastDivVisible, setIsLastDivVisible] = useState(false);
  const [lastPost, setLastPost] = useState(null);
  const lastDiv = useRef();

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    setLastPost(null);
    handlePosts();
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [filter]);

  const scrollHandler = () => {
    if (isLoading) {
      return;
    } else if (
      lastDiv.current &&
      window.pageYOffset + window.innerHeight >= lastDiv.current.offsetTop
    ) {
      updateVisibility(true);
    }
  };

  const updateVisibility = (value) =>
    value !== isLastDivVisible ? setIsLastDivVisible(value) : null;

  const handlePosts = async () => {
    setPosts([]);
    setLastPost(null);
    setAlert(null);
    switch (filter) {
      case "all":
        const publicPosts = await getLatestPosts();
        if (publicPosts === "error") {
          return;
        }
        setLastPost(publicPosts.lastDoc);
        setPosts(publicPosts.posts);
        return;

      case "following":
        const followersPosts = await getFollowersPosts("following");
        if (followersPosts === "error") {
          return;
        } else if (followersPosts === "error/no-followings") {
          setAlert("You're Not Following Anyone");
          return;
        }
        setLastPost(followersPosts.lastDoc);
        setPosts(followersPosts.posts);
        return;

      case "followers":
        const followingUsersPosts = await getFollowersPosts("followers");
        if (followingUsersPosts === "error") {
          return;
        } else if (followingUsersPosts === "error/no-followings") {
          setAlert("You've No Followers");
          return;
        }
        setLastPost(followingUsersPosts.lastDoc);
        setPosts(followingUsersPosts.posts);
        return;

      default:
        setAlert("Invalid Filter");
        return;
    }
  };

  const getMorePosts = async () => {
    if (!lastPost) {
      return;
    }
    setIsLoading(true);
    switch (filter) {
      case "all":
        const publicPosts = await getLatestPosts(lastPost);
        if (publicPosts === "error") {
          return;
        }
        setLastPost(publicPosts.lastDoc);
        setPosts(posts.concat(publicPosts.posts));
        break;

      case "following":
        const followersPosts = await getFollowersPosts("following", lastPost);
        if (followersPosts === "error") {
          return;
        }
        setLastPost(followersPosts.lastDoc);
        setPosts(posts.concat(followersPosts.posts));
        break;

      case "followers":
        const followingUsersPosts = await getFollowersPosts(
          "followers",
          lastPost
        );
        if (followingUsersPosts === "error") {
          return;
        }
        setLastPost(followingUsersPosts.lastDoc);
        setPosts(posts.concat(followingUsersPosts.posts));
        break;

      default:
        return;
    }
    setIsLoading(false);
    setIsLastDivVisible(false);
  };

  if (alert) {
    return (
      <div className="home-container">
        <div className="home-alert">{alert}</div>
        <div className="show-all" onClick={() => updateFilter("all")}>
          Show All Posts
        </div>
      </div>
    );
  } else if (isLastDivVisible && !isLoading) {
    getMorePosts();
  }

  return (
    <div className="user-home-page home-container">
      {posts.length === 0 ? (
        <ReactLoading type="spin" color="#3d405b" height="60px" width="60px" />
      ) : (
        <>
          {posts.map((post, index) => (
            <PostContainer
              title={post.postTitle}
              caption={post.postCaption}
              imgUrl={post.postImage}
              timeStamp={post.timeStamp}
              userId={post.uid}
              id={post.id}
              key={index}
            />
          ))}
          <div ref={lastDiv}></div>
        </>
      )}
    </div>
  );
};

export default UserHomePage;
