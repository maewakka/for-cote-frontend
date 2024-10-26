// src/components/TestCaseModal.js

import React, { useState } from 'react';
import styles from '../styles/TestCaseModal.module.css';

const TestCaseModal = ({ onClose, onAdd }) => {
  const [newInput, setNewInput] = useState('');
  const [newOutput, setNewOutput] = useState('');

  const handleAddTestCase = () => {
    onAdd(newInput, newOutput);
    setNewInput('');
    setNewOutput('');
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>새 테스트 케이스 추가</h3>
        <label>
          입력값:
          <textarea
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
          />
        </label>
        <label>
          출력값:
          <textarea
            value={newOutput}
            onChange={(e) => setNewOutput(e.target.value)}
          />
        </label>
        <button onClick={handleAddTestCase}>추가</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
};

export default TestCaseModal;
