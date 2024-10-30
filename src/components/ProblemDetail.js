import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserDetails } from '../store/userSlice';
import TestCaseModal from './TestCaseModal';
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
  const [outputs, setOutputs] = useState([]); 
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); 
  const [isOptimizing, setIsOptimizing] = useState(false);
  const previousCodeRef = useRef(null);

  const dispatch = useDispatch();
  const userEmail = useSelector((state) => state.user.user?.email);
  const [todayAssistCount, setTodayAssistCount] = useState(0);

  const javaDefaultCode = `import java.util.*;\nimport java.io.*;\n
public class Main {
    public static void main(String[] args) throws IOException {
        // continue
    }
}`;

  const getAssistCount = async () => {
    const countResponse = await axios.get('/api/optimize-count');
    setTodayAssistCount(countResponse.data);
  };

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        const response = await axios.get(`/api/problem/${problem_id}`);
        let description = response.data.description;
        let input = response.data.input;
        let output = response.data.output;
        
        description = description.replace(/<img\s+[^>]*src="(\/[^"]*)"/g, '<img src="/baekjoon$1"');
        description = description.replace(/\$(.*?)\$/g, '\\($1\\)');
        input = input.replace(/\$(.*?)\$/g, '\\($1\\)');
        output = output.replace(/\$(.*?)\$/g, '\\($1\\)');

        setProblemData({ ...response.data, description, input, output});
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
        setCode(savedCode || (language === 'JAVA' ? javaDefaultCode : ''));
      } catch (error) {
        console.error('저장된 코드를 불러오는 중 오류 발생:', error);
      } finally {
        getAssistCount();
      }
    } else {
      setCode(languageCodes[language] || (language === 'JAVA' ? javaDefaultCode : ''));
    }
  };

  useEffect(() => {
    initCode();
  }, [language, userEmail, problem_id]);

  if (loading) return <div>Loading...</div>;
  if (!problemData) {
    return <div>문제 데이터를 불러오지 못했습니다.</div>;
  }

  const handleOptimizeCode = async () => {
    previousCodeRef.current = code;
    setIsOptimizing(true);
    try {
      const response = await axios.post('/api/optimize', { code });
      setCode(response.data);
      getAssistCount();
    } catch (error) {
      console.error('코드 최적화 중 오류 발생:', error);
      alert(error.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUndoOptimization = () => {
    if (previousCodeRef.current !== null) {
      setCode(previousCodeRef.current);
      previousCodeRef.current = null;
    }
  };

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => alert('코드가 클립보드에 복사되었습니다.'))
      .catch((err) => console.error('코드 복사 중 오류 발생:', err));
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

  const addTestCase = (input, output) => {
    const newExample = { input, output };
    setProblemData((prevData) => ({
      ...prevData,
      examples: [...prevData.examples, newExample],
    }));

    setOutputs((prevOutputs) => [...prevOutputs, '']);
    setResults((prevResults) => [...prevResults, null]);
  };

  return (
    <MathJaxContext config={{ options: { processSectionDelay: 0, renderSectionDelay: 0 } }}>
      {isOptimizing && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>코드 최적화 중...</p>
        </div>
      )}
      <div className={styles.problemContainer}>
        <div className={styles.problemDescription}>
          <h1>{problemData?.title || '제목 없음'}</h1>
          <MathJax>
            <div
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: problemData.description }}
            ></div>
          </MathJax>

          <h2>입력</h2>
          <MathJax>
            <div
              className={styles.inputOutputBox}
              dangerouslySetInnerHTML={{ __html: problemData.input }}
            ></div>
          </MathJax>

          <h2>출력</h2>
          <MathJax>
            <div
              className={styles.inputOutputBox}
              dangerouslySetInnerHTML={{ __html: problemData.output }}
            ></div>
          </MathJax>
            
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
            {userEmail && (<button onClick={handleUndoOptimization} className={styles.copyButton}>최적화 취소</button>)}
            <button onClick={handleCopyCode} className={styles.copyButton}>코드 복사</button>
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
            {userEmail && (
              <>
                <button onClick={handleOptimizeCode} disabled={isOptimizing}>코드 최적화 | {todayAssistCount}</button>
              </>
            )}
          </div>
          <div className={styles.rightButtons}>
            {userEmail && <button onClick={handleSaveCode}>코드 저장</button>}
            <button onClick={handleExecuteCode}>코드 실행</button>
            <button onClick={handleSubmitProblem}>문제 제출</button>
          </div>
        </div>

        {showModal && (
          <TestCaseModal
            onClose={() => setShowModal(false)}
            onAdd={addTestCase}
          />
        )}
      </div>
    </MathJaxContext>
  );
};

export default ProblemDetail;
