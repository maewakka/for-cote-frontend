// src/components/Navigator.js

import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';
import styles from '../styles/Navigator.module.css';

const Navigator = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>Your Logo</div>
        <Link to="/" className={styles.navButton}>
          단계별 문제
        </Link>
      </div>

      <button className={styles.githubButton}>
        <FaGithub className={styles.githubIcon} />
        GitHub Login
      </button>
    </nav>
  );
};

export default Navigator;
