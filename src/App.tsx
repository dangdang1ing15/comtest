import { useState } from 'react';
import './App.css';
import SurveyTest from './SurveyTest';
import ReportCard from './report/ReportCard';
import type { Level, Answer } from './testData';

type View = 'survey' | 'report';

export default function App() {
  const [view, setView] = useState<View>('survey');
  const [surveyLevel, setSurveyLevel] = useState<Level>('basic');
  const [answersByLevel, setAnswersByLevel] = useState<Record<Level, Map<number, Answer>>>({
    basic: new Map(),
    advanced: new Map(),
  });

  const updateAnswers = (level: Level, next: Map<number, Answer>) => {
    setAnswersByLevel((prev) => ({ ...prev, [level]: next }));
  };

  const goToSurvey = (level: Level) => {
    setSurveyLevel(level);
    setView('survey');
  };

  return (
    <div className="app-shell">
      <nav className="app-tabbar">
        <button
          type="button"
          className={`app-tab ${view === 'survey' ? 'active' : ''}`}
          onClick={() => setView('survey')}
        >
          📝 자가진단 테스트
        </button>
        <button
          type="button"
          className={`app-tab ${view === 'report' ? 'active' : ''}`}
          onClick={() => setView('report')}
        >
          📊 성적표
        </button>
      </nav>
      {view === 'survey' ? (
        <SurveyTest
          level={surveyLevel}
          onLevelChange={setSurveyLevel}
          answers={answersByLevel[surveyLevel]}
          onAnswersChange={(next) => updateAnswers(surveyLevel, next)}
          onViewReport={() => setView('report')}
        />
      ) : (
        <ReportCard answersByLevel={answersByLevel} onStartTest={goToSurvey} />
      )}
    </div>
  );
}
