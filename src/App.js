// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navigator from './components/Navigator';
import ProblemList from './components/ProblemList';
import StepDetail from './components/StepDetail';
import ProblemDetail from './components/ProblemDetail';
import Footer from './components/Footer'; // Footer 컴포넌트 추가
import styles from './styles/App.module.css'; // App.module.css 추가

const App = () => {
  return (
    <Router>
      <div className={styles.container}>
        <header className={styles.header}>
          <Navigator />
        </header>
        <main className={styles.body}>
          <Routes>
            <Route path="/" element={<Outlet />}> {/* Outlet을 통해 하위 라우팅 관리 */}
              <Route index element={<ProblemList />} />
              <Route path="step/:step_id" element={<StepDetail />} />
              <Route path="problem/:problem_id" element={<ProblemDetail />} />
            </Route>
          </Routes>
        </main>
        <footer className={styles.footer}>
          <Footer />
        </footer>
      </div>
    </Router>
  );
};

export default App;
