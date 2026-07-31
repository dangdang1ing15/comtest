import { useState } from 'react';
import './App.css';
import SurveyTest from './SurveyTest';
import ReportCard from './report/ReportCard';
import WrongNote from './report/WrongNote';
import type { Level } from './testData';
import { useSharedState } from './store/sharedState';

type View = 'survey' | 'report' | 'wrongnote';

export default function App() {
  const [view, setView] = useState<View>('survey');
  const [surveyLevel, setSurveyLevel] = useState<Level>('basic');
  const { answersByLevel, reviewedByLevel, updateAnswers, updateReviewed } = useSharedState();

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
        <button
          type="button"
          className={`app-tab ${view === 'wrongnote' ? 'active' : ''}`}
          onClick={() => setView('wrongnote')}
        >
          📕 오답노트
        </button>
      </nav>
      {view === 'survey' && (
        <SurveyTest
          level={surveyLevel}
          onLevelChange={setSurveyLevel}
          answers={answersByLevel[surveyLevel]}
          onAnswersChange={(next) => updateAnswers(surveyLevel, next)}
          onViewReport={() => setView('report')}
        />
      )}
      {view === 'report' && <ReportCard answersByLevel={answersByLevel} onStartTest={goToSurvey} />}
      {view === 'wrongnote' && (
        <WrongNote
          answersByLevel={answersByLevel}
          reviewedByLevel={reviewedByLevel}
          onReviewedChange={updateReviewed}
          onStartTest={goToSurvey}
        />
      )}
    </div>
  );
}
