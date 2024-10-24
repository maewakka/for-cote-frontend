// src/components/StepDetail.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/StepDetail.module.css';

const StepDetail = () => {
  const { step_id } = useParams();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // navigate 훅 추가

  useEffect(() => {
    const fetchStepDetails = async () => {
      try {
        const response = await axios.get(`/api/step/${step_id}`);
        setProblems(response.data);
        setLoading(false);
      } catch (error) {
        console.error('단계 상세 데이터를 불러오는 중 오류 발생:', error);
        setLoading(false);
      }
    };

    fetchStepDetails();
  }, [step_id]);

  if (loading) return <div>Loading...</div>;

  const handleProblemClick = (problemId) => {
    navigate(`/problem/${problemId}`); // 문제 클릭 시 문제 상세 페이지로 이동
  };

  const handleBackClick = () => {
    navigate(-1); // 뒤로가기 버튼 클릭 시 이전 페이지로 이동
  };

  return (
    <div className={styles.stepDetail}>
      <button className={styles.backButton} onClick={handleBackClick}>
        뒤로가기
      </button> {/* 뒤로가기 버튼 추가 */}
      <h1>Step {step_id}</h1>
      <h2>문제 목록</h2>
      <table className={styles.problemTable}>
        <thead>
          <tr>
            <th>문제 번호</th>
            <th>제목</th>
            <th>정답률</th>
            <th>풀이 횟수</th>
            <th>제출 횟수</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr key={problem.id} onClick={() => handleProblemClick(problem.problem_id)}> {/* 문제 클릭 시 */}
              <td>{problem.problem_id}</td>
              <td>{problem.title}</td>
              <td>{problem.correct_percentage}%</td>
              <td>{problem.solved_count}</td>
              <td>{problem.submission_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StepDetail;
