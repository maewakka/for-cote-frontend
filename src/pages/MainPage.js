// src/pages/MainPage.js

import React from 'react';
import styles from '../styles/MainPage.module.css';

// Reusable components
import Navigator from '../components/Navigator';
import ProblemList from '../components/ProblemList';

const MainPage = () => {
  return (
    <div className={styles.container}>
      {/* Navigator with logo and GitHub login */}
      <Navigator />

      {/* Body section with problem list */}
      <div className={styles.body}>
        <ProblemList />
      </div>

      {/* Footer with copyright */}
      <footer className={styles.footer}>
        <p>&copy; 2024 YourServiceName. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainPage;
