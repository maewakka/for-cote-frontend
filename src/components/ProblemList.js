// src/components/ProblemList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ProblemList.module.css';

const ProblemList = () => {
  const [steps, setSteps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await axios.get('/api/step');
        setSteps(response.data);
      } catch (error) {
        console.error('단계 목록을 불러오는 중 오류 발생:', error);
      }
    };

    fetchSteps();
  }, []);

  const handleStepClick = (stepId, title) => {
    // 단계 번호와 제목을 URL에 넘겨줌
    navigate(`/step/${stepId}`, { state: { stepId, title } });
  };

  return (
    <div className={styles.problemList}>
      <h1>단계별 문제</h1>
      <table className={styles.stepTable}>
        <thead>
          <tr>
            <th>단계</th>
            <th>제목</th>
            <th>설명</th>
            <th>문제 수</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step) => (
            <tr key={step.step_id} onClick={() => handleStepClick(step.step_id, step.title)}>
              <td>{step.step_id}</td>
              <td>{step.title}</td>
              <td>{step.description}</td>
              <td>{step.problems_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProblemList;
