import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "./Cards/Sidebar";
import "./Home.css";
import PublicHomePage from "./PublicHomePage";
import UserHomePage from "./UserHomePage";

const HomePage = () => {
  const userInfo = useSelector((state) => state.user);
  const [filter, setFilter] = useState("following");

  const changeFilter = (newFilter) => setFilter(newFilter);

  const useIntersection = (element, rootMargin) => {
    const [isVisible, setState] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setState(true);
          } else {
            setState(false);
          }
        },
        { rootMargin }
      );

      element.current && observer.observe(element.current);

      return () => element.current && observer.unobserve(element.current);
    }, []);

    return isVisible;
  };

  return (
    <div className="home">
      {userInfo.user ? (
        <UserHomePage
          filter={filter}
          updateFilter={changeFilter}
          useIntersection={useIntersection}
        />
      ) : (
        <PublicHomePage useIntersection={useIntersection} />
      )}
      <Sidebar changeFilter={changeFilter} filter={filter} />
      <Link to="/clonegram/new-post">
        <button className="new-post-btn">New</button>
      </Link>
    </div>
  );
};

export default HomePage;
