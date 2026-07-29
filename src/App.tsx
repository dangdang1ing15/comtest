import { useState } from 'react';
import './App.css';
import SurveyTest from './SurveyTest';
import ReportCard from './report/ReportCard';
import WrongNote from './report/WrongNote';
import { testData, type Level, type Answer } from './testData';

type View = 'survey' | 'report' | 'wrongnote';

// 과외 학생이 베이직(기본) 100문항 중 실제로 틀린 문항 번호. 나머지는 전부 맞은 것으로 채점한다.
const STUDENT_WRONG_BASIC_IDS = new Set([
  7, 10, 12, 15, 16, 25, 28, 30, 33, 34, 35, 36, 44, 47, 48, 49, 50, 54, 64, 65, 66, 67, 68, 69, 70, 71, 72, 75, 76,
  80, 81, 86, 88, 91, 92, 93, 94, 95, 96, 97, 98, 100,
]);

function buildInitialBasicAnswers(): Map<number, Answer> {
  const answers = new Map<number, Answer>();
  for (const part of testData.basic) {
    for (const q of part.questions) {
      answers.set(q.id, STUDENT_WRONG_BASIC_IDS.has(q.id) ? 'no' : 'yes');
    }
  }
  return answers;
}

export default function App() {
  const [view, setView] = useState<View>('survey');
  const [surveyLevel, setSurveyLevel] = useState<Level>('basic');
  const [answersByLevel, setAnswersByLevel] = useState<Record<Level, Map<number, Answer>>>({
    basic: buildInitialBasicAnswers(),
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
      {view === 'wrongnote' && <WrongNote answersByLevel={answersByLevel} onStartTest={goToSurvey} />}
    </div>
  );
}
