import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { useSelector } from 'react-redux';
import TestCaseModal from './TestCaseModal'; // 모달 컴포넌트 추가
import styles from '../styles/ProblemDetail.module.css';

const ProblemDetail = () => {
  const { problem_id } = useParams();
  const [problemData, setProblemData] = useState(null);
  const [language, setLanguage] = useState('PYTHON');
  const [code, setCode] = useState('');
  const [languageCodes, setLanguageCodes] = useState({
    PYTHON: '',
    JAVA: '',
  });
  const [outputs, setOutputs] = useState([]); // 실행 출력 관리
  const [results, setResults] = useState([]); // 실행 결과 관리
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // 모달 상태 관리

  const userEmail = useSelector((state) => state.user.user?.email);

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        const response = await axios.get(`/api/problem/${problem_id}`);
        let description = response.data.description;
        description = description.replace(/<img\s+[^>]*src="(\/[^"]*)"/g, '<img src="/baekjoon$1"');
        setProblemData({ ...response.data, description });
        setOutputs(Array(response.data.examples.length).fill(''));
        setResults(Array(response.data.examples.length).fill(null));
        setLoading(false);
      } catch (error) {
        console.error('문제 데이터를 불러오는 중 오류 발생:', error);
        setLoading(false);
      }
    };
    fetchProblemDetails();
  }, [problem_id]);

  const initCode = async () => {
    if (userEmail) {
      try {
        const response = await axios.get('/api/code', {
          params: { email: userEmail, problem_id, language: language },
        });
        const savedCode = response.data || '';
        setLanguageCodes((prevCodes) => ({
          ...prevCodes,
          [language]: savedCode,
        }));
        setCode(savedCode);
      } catch (error) {
        console.error('저장된 코드를 불러오는 중 오류 발생:', error);
      }
    } else {
      setCode(languageCodes[language] || '');
    }
  };

  useEffect(() => {
    initCode();
  }, [language, userEmail, problem_id]);

  if (loading) return <div>Loading...</div>;
  if (!problemData) {
    return <div>문제 데이터를 불러오지 못했습니다.</div>;
  }

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;

    setLanguageCodes((prevCodes) => ({
      ...prevCodes,
      [language]: code,
    }));
    setLanguage(newLanguage);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleExecuteCode = async () => {
    setOutputs(Array(problemData.examples.length).fill('실행 중...'));
    setResults(Array(problemData.examples.length).fill(null));

    for (const [index, example] of problemData.examples.entries()) {
      try {
        const response = await axios.post('/api/execute', {
          language: language.toUpperCase(),
          code,
          input: example.input,
          problem_id,
          email: userEmail || null,
        });

        const actualOutput = response.data.output.replace(/\r\n/g, '\n').trim();
        const expectedOutput = example.output.replace(/\r\n/g, '\n').trim();
        const passed = actualOutput === expectedOutput;

        setOutputs((prevOutputs) => {
          const updatedOutputs = [...prevOutputs];
          updatedOutputs[index] = actualOutput;
          return updatedOutputs;
        });

        setResults((prevResults) => {
          const updatedResults = [...prevResults];
          updatedResults[index] = passed;
          return updatedResults;
        });
      } catch (error) {
        console.error('코드 실행 중 오류 발생:', error);

        setOutputs((prevOutputs) => {
          const updatedOutputs = [...prevOutputs];
          updatedOutputs[index] = '실행 실패';
          return updatedOutputs;
        });

        setResults((prevResults) => {
          const updatedResults = [...prevResults];
          updatedResults[index] = false;
          return updatedResults;
        });
      }
    }
  };

  const handleSaveCode = async () => {
    try {
      await axios.post('/api/save', {
        language: language.toUpperCase(),
        code,
        input: null,
        problem_id,
        email: userEmail,
      });

      alert('코드가 저장되었습니다.');
    } catch (error) {
      console.error('코드 저장 중 오류 발생:', error);
      alert('코드 저장에 실패했습니다.');
    }
  };

  const handleSubmitProblem = () => {
    window.open(`https://www.acmicpc.net/submit/${problem_id}`, '_blank');
  };

  // 새로운 테스트 케이스 추가
  const addTestCase = (input, output) => {
    const newExample = { input, output };
    setProblemData((prevData) => ({
      ...prevData,
      examples: [...prevData.examples, newExample],
    }));

    // outputs와 results 배열에도 새 테스트 케이스를 추가
    setOutputs((prevOutputs) => [...prevOutputs, '']);
    setResults((prevResults) => [...prevResults, null]);
  };

  return (
    <div className={styles.problemContainer}>
      <div className={styles.problemDescription}>
        <h1>{problemData?.title || '제목 없음'}</h1>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: problemData.description }}
        ></div>
        <h2>입력</h2>
        <div className={styles.inputOutputBox}>
          <pre>{problemData.input}</pre>
        </div>
        <h2>출력</h2>
        <div className={styles.inputOutputBox}>
          <pre>{problemData.output}</pre>
        </div>

        {problemData.examples && (
          <div className={styles.examples}>
            <h2>예제</h2>
            {problemData.examples.map((example, index) => (
              <div key={index} className={styles.example}>
                <h3>예제 {index + 1}</h3>
                <div className={styles.exampleItem}>
                  <strong>입력:</strong>
                  <div className={styles.inputOutputBox}>
                    <pre>{example.input}</pre>
                  </div>
                </div>
                <div className={styles.exampleItem}>
                  <strong>출력:</strong>
                  <div className={styles.inputOutputBox}>
                    <pre>{example.output}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.editorContainer}>
        <div className={styles.languageSelector}>
          <label htmlFor="language">언어 선택: </label>
          <select id="language" value={language} onChange={handleLanguageChange}>
            <option value="PYTHON">Python</option>
            <option value="JAVA">Java</option>
          </select>
        </div>

        <MonacoEditor
          height="70%"
          language={language.toLowerCase()}
          value={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            selectOnLineNumbers: true,
            automaticLayout: true,
            fontSize: 16,
            minimap: { enabled: false },
          }}
        />

        <div className={styles.output}>
          <h3>실행 결과</h3>
          {problemData.examples && problemData.examples.map((example, index) => (
            <div key={index} className={styles.testResultBox}>
              <h4>테스트 {index + 1}</h4>
              <p>
                <span className={styles.resultLabel}>입력값 &gt;</span>
                <span className={styles.resultValue}>{example.input}</span>
              </p>
              <p>
                <span className={styles.resultLabel}>기대값 &gt;</span>
                <pre className={styles.resultValue}>{example.output}</pre>
              </p>
              <p>
                <span className={styles.resultLabel}>출력값 &gt;</span>
                <pre className={styles.resultValue}>{outputs[index]}</pre>
              </p>
              <p>
                <span className={styles.resultLabel}>결과 &gt;</span>
                <span className={results[index] === null ? '' : results[index] ? styles.pass : styles.fail}>
                  {results[index] === null ? '' : results[index] ? '테스트를 통과했습니다.' : '실행한 결과값이 다릅니다.'}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <div className={styles.leftButtons}>
          <button onClick={() => setShowModal(true)}>테스트 케이스 추가</button>
        </div>
        <div className={styles.rightButtons}>
          {userEmail && <button onClick={handleSaveCode}>코드 저장</button>}
          <button onClick={handleExecuteCode}>코드 실행</button>
          <button onClick={handleSubmitProblem}>문제 제출</button>
        </div>
      </div>

      {/* 모달 컴포넌트 */}
      {showModal && (
        <TestCaseModal
          onClose={() => setShowModal(false)}
          onAdd={addTestCase}
        />
      )}
    </div>
  );
};

export default ProblemDetail;
