// src/components/Navigator.js

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import { FiMoreHorizontal, FiSearch } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserDetails, logout } from '../store/userSlice';
import styles from '../styles/Navigator.module.css';

const Navigator = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [problemNumber, setProblemNumber] = useState('');

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserDetails());
    }
  }, [user, dispatch]);

  const handleGitHubLogin = () => {
    window.location.href = '/api/oauth2/authorization/github';
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/api/logout';
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSearchProblem = () => {
    if (problemNumber.trim()) {
      navigate(`/problem/${problemNumber}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchProblem();
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <img src="/logo.jpeg" alt="Logo" className={styles.logo} />
        <Link to="/" className={styles.navButton}>단계별 문제</Link>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.problemSearch}>
          <input
            type="text"
            placeholder="문제 번호"
            value={problemNumber}
            onChange={(e) => setProblemNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            className={styles.problemInput}
          />
          <button onClick={handleSearchProblem} className={styles.searchButton}>
            <FiSearch />
          </button>
        </div>

        {!user ? 
          (
            <button className={styles.githubButton} onClick={handleGitHubLogin}>
              <FaGithub className={styles.githubIcon} />
              GitHub Login
            </button>
          ):
        (
          <>
            {user.profile_img_url && (
              <img
                src={user.profile_img_url}
                alt="프로필 이미지"
                className={styles.profileImage}
              />
            )}
            <div className={styles.welcomeMessage}>
              {!user.name || user.name.trim() === "" ? user.email : user.name} 님, 반갑습니다!
            </div>
            <div className={styles.moreButtonContainer}>
              <button className={styles.moreButton} onClick={toggleDropdown}>
                <FiMoreHorizontal />
              </button>
              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigator;
