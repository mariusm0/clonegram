import React, { useEffect, useState, useRef } from "react";
import { getLatestPosts } from "../../FirebaseFunctions";

import PostContainer from "./Cards/PostContainer";
import ReactLoading from "react-loading";

const PublicHomePage = () => {
  const [posts, setPosts] = useState([]);
  const [lastPost, setLastPost] = useState(null);
  const [isLastDivVisible, setIsLastDivVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const lastDiv = useRef();

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    handlePosts();

    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

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
    const result = await getLatestPosts();
    if (result === "error") {
      return;
    }
    setPosts(result.posts);
    setLastPost(result.lastDoc);
  };

  const getMorePosts = async () => {
    setIsLoading(true);
    if (!lastPost) {
      return;
    }
    const result = await getLatestPosts(lastPost);
    if (result === "error") {
      setLastPost(null);
      return;
    }
    setPosts(posts.concat(result.posts));
    setLastPost(result.lastDoc);
    setIsLoading(false);
    setIsLastDivVisible(false);
  };

  // If the end of the page is reached and new posts aren't currently loading get morePosts
  if (isLastDivVisible && !isLoading) {
    getMorePosts();
  }

  return (
    <div className="public-home-page home-container">
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

export default PublicHomePage;
