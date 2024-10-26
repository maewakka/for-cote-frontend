// src/components/Footer.js

import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>
        © 2023 All Rights Reserved.{' '}
        <a href="https://startlink.io/" target="_blank" rel="noopener noreferrer" className={styles.link}>
          주식회사 스타트링크
        </a>
      </p>
    </footer>
  );
};

export default Footer;
