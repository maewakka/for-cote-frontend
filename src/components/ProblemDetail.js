import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MonacoEditor from '@monaco-editor/react';
import styles from '../styles/ProblemDetail.module.css';

const ProblemDetail = () => {
  const { problem_id } = useParams();
  const [problemData, setProblemData] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(''); // 현재 에디터에 표시되는 코드
  const [languageCodes, setLanguageCodes] = useState({
    javascript: '',
    cpp: '',
    python: '',
  }); // 각 언어별 코드 저장 객체
  const [output, setOutput] = useState(''); // 실행 결과
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        const response = await axios.get(`/api/problem/${problem_id}`);
        console.log(response)
        let description = response.data.description;

        // 이미지 태그의 src 속성 앞에 '/api3' 추가
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

  // 문제 데이터가 null인지 확인하고 null이 아니면 렌더링
  if (!problemData) {
    return <div>문제 데이터를 불러오지 못했습니다.</div>;
  }

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;

    // 현재 코드를 저장
    setLanguageCodes((prevCodes) => ({
      ...prevCodes,
      [language]: code,
    }));

    // 새 언어로 변경하면서 해당 언어의 코드를 에디터에 불러옴
    setCode(languageCodes[newLanguage] || '');
    setLanguage(newLanguage);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleExecuteCode = () => {
    const simulatedOutput = `Code executed with output: ${code.length} characters`;
    setOutput(simulatedOutput);
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

        {/* 예제 입력과 출력 */}
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
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>
        </div>

        <MonacoEditor
          height="70%"  // 에디터 높이 70%
          language={language}
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
          <pre>{output || '결과가 여기 표시됩니다.'}</pre>
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
          <button>문제 제출</button>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
