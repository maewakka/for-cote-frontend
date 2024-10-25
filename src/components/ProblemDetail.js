import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
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
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        const response = await axios.get(`/api/problem/${problem_id}`);
        let description = response.data.description;
        description = description.replace(/<img\s+[^>]*src="(\/[^"]*)"/g, '<img src="/baekjoon$1"');
        setProblemData({ ...response.data, description });
        setLoading(false);
      } catch (error) {
        console.error('문제 데이터를 불러오는 중 오류 발생:', error);
        setLoading(false);
      }
    };

    fetchProblemDetails();
  }, [problem_id]);

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
    setCode(languageCodes[newLanguage] || '');
    setLanguage(newLanguage);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleExecuteCode = async () => {
    setOutput([]);
    for (const [index, example] of problemData.examples.entries()) {
      setOutput((prevOutput) => [
        ...prevOutput,
        {
          input: example.input,
          expectedOutput: example.output,
          actualOutput: '실행 중...',
          passed: false,
        },
      ]);

      try {
        const response = await axios.post('/api/execute', {
          language: language.toUpperCase(),
          code,
          input: example.input,
        });

        const actualOutput = response.data.output.replace(/\r\n/g, '\n').trim();
        const expectedOutput = example.output.replace(/\r\n/g, '\n').trim();
        const passed = actualOutput === expectedOutput;

        setOutput((prevOutput) => {
          const updatedResults = [...prevOutput];
          updatedResults[index] = {
            input: example.input,
            expectedOutput,
            actualOutput,
            passed,
          };
          return updatedResults;
        });
      } catch (error) {
        console.error('코드 실행 중 오류 발생:', error);

        setOutput((prevOutput) => {
          const updatedResults = [...prevOutput];
          updatedResults[index] = {
            input: example.input,
            expectedOutput: example.output,
            actualOutput: '실행 실패',
            passed: false,
          };
          return updatedResults;
        });
      }
    }
  };

  // 문제 제출 버튼 클릭 시 새로운 탭에서 제출 페이지 열기
  const handleSubmitProblem = () => {
    window.open(`https://www.acmicpc.net/submit/${problem_id}`, '_blank');
  };

  return (
    <div className={styles.problemContainer}>
      <div className={styles.problemDescription}>
        <h1>{problemData.title || '제목 없음'}</h1>
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
          {output && output.map((result, index) => (
            <div key={index} className={styles.testResultBox}>
              <h4>테스트 {index + 1}</h4>
              <p>
                <span className={styles.resultLabel}>입력값 &gt;</span>
                <span className={styles.resultValue}>{result.input}</span>
              </p>
              <p>
                <span className={styles.resultLabel}>기대값 &gt;</span>
                <pre className={styles.resultValue}>{result.expectedOutput}</pre>
              </p>
              <p>
                <span className={styles.resultLabel}>출력값 &gt;</span>
                <pre className={styles.resultValue}>{result.actualOutput}</pre>
              </p>
              <p>
                <span className={styles.resultLabel}>결과 &gt;</span>
                <span className={result.passed ? styles.pass : styles.fail}>
                  {result.passed ? '테스트를 통과했습니다.' : '실행한 결과값이 다릅니다.'}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <div className={styles.leftButtons}>
          <button>테스트 케이스 추가</button>
          <button>문제 질문</button>
          <button>코드 최적화</button>
        </div>
        <div className={styles.rightButtons}>
          <button onClick={handleExecuteCode}>코드 실행</button>
          <button onClick={handleSubmitProblem}>문제 제출</button>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
