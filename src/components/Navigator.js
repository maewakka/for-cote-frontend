import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserDetails, logout } from '../store/userSlice';
import styles from '../styles/Navigator.module.css';

const Navigator = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [showDropdown, setShowDropdown] = useState(false);

  // 사용자 정보가 없을 때만 fetchUserDetails 디스패치
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

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>Your Logo</div>
        <Link to="/" className={styles.navButton}>단계별 문제</Link>
      </div>

      <div className={styles.rightSection}>
        {user ? (
          <>
            {user.profile_img_url && (
              <img
                src={user.profile_img_url}
                alt="프로필 이미지"
                className={styles.profileImage}
              />
            )}
            <div className={styles.welcomeMessage}>
              {user.name} 님, 반갑습니다!
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
        ) : (
          <button className={styles.githubButton} onClick={handleGitHubLogin}>
            <FaGithub className={styles.githubIcon} />
            GitHub Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navigator;
