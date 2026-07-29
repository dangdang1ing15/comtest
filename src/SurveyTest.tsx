import { useMemo, useRef, useEffect, useState, type CSSProperties } from 'react';
import './SurveyTest.css';
import { testData, type Level, type Answer } from './testData';

const ACCENT: Record<Level, 'green' | 'plum'> = {
  basic: 'green',
  advanced: 'plum',
};

const LEVEL_LABEL: Record<Level, string> = {
  basic: '🐥 베이직 · 컴맹 탈출',
  advanced: '🔥 어드밴스 · 크리에이터',
};

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}

type SurveyTestProps = {
  level: Level;
  onLevelChange: (level: Level) => void;
  answers: Map<number, Answer>;
  onAnswersChange: (answers: Map<number, Answer>) => void;
  onViewReport: () => void;
};

export default function SurveyTest({ level, onLevelChange, answers, onAnswersChange, onViewReport }: SurveyTestProps) {
  const [showResult, setShowResult] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const copyTimeoutRef = useRef<number | null>(null);

  const currentTestData = testData[level];
  const accent = ACCENT[level];

  const totalQuestions = useMemo(() => {
    return currentTestData.reduce((acc, part) => acc + part.questions.length, 0);
  }, [currentTestData]);

  const answeredCount = answers.size;
  const remainingCount = totalQuestions - answeredCount;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const yesCount = useMemo(() => {
    let n = 0;
    answers.forEach((v) => {
      if (v === 'yes') n++;
    });
    return n;
  }, [answers]);

  const noIds = useMemo(() => {
    const ids: number[] = [];
    answers.forEach((v, id) => {
      if (v === 'no') ids.push(id);
    });
    return ids.sort((a, b) => a - b);
  }, [answers]);

  const clearCopyTimeout = () => {
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = null;
    }
  };

  useEffect(() => clearCopyTimeout, []);

  // 탭을 옮겨도 각 레벨의 진행 상황은 서로 독립적으로 유지되므로, 여기서는
  // 결과 화면/복사 상태 같은 화면 전용 UI 상태만 초기화한다.
  useEffect(() => {
    setShowResult(false);
    setCopyStatus('idle');
    clearCopyTimeout();
  }, [level]);

  const handleAnswer = (id: number, value: Answer) => {
    const next = new Map(answers);
    if (next.get(id) === value) next.delete(id);
    else next.set(id, value);
    onAnswersChange(next);
  };

  const resetTest = () => {
    onAnswersChange(new Map());
    setShowResult(false);
    setCopyStatus('idle');
    clearCopyTimeout();
  };

  const flashCopied = () => {
    setCopyStatus('copied');
    clearCopyTimeout();
    copyTimeoutRef.current = window.setTimeout(() => setCopyStatus('idle'), 1500);
  };

  const handleCopyNoList = () => {
    if (noIds.length === 0) return;
    const text = noIds.join(', ');

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(flashCopied)
        .catch(() => {
          if (legacyCopy(text)) flashCopied();
        });
    } else if (legacyCopy(text)) {
      flashCopied();
    }
  };

  const getResultGraphic = (percent: number) => {
    if (percent < 40)
      return {
        emoji: '🌱',
        ringColor: 'var(--green)',
        title: '새싹 타이핑 마스터',
        desc: '기본기를 쑥쑥 키워가는 단계예요. 단축키와 친해져 볼까요?',
      };
    if (percent < 80)
      return {
        emoji: '🚀',
        ringColor: 'var(--blue)',
        title: '수행평가 불도저',
        desc: '학교 과제쯤은 혼자서 거뜬해요! 조금만 더 다듬으면 완벽합니다.',
      };
    return {
      emoji: '👑',
      ringColor: 'var(--gold)',
      title: '디지털 크리에이터',
      desc: '컴맹 완벽 탈출! 이제 컴퓨터로 세상을 만들어갈 준비가 되었습니다.',
    };
  };

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100) || 0;
  const scorePercent = Math.round((yesCount / totalQuestions) * 100) || 0;
  const result = getResultGraphic(scorePercent);

  return (
    <div className="page">
      <div className="container">
        {/* 헤더 섹션 */}
        <header className="hero">
          <span className="hero-eyebrow">Digital Literacy Check</span>
          <h1 className="hero-title">내 컴퓨터 생존 능력은? 🤔</h1>
          <p className="hero-subtitle">솔직하게 체크하고 나의 디지털 레벨을 확인해보세요.</p>
        </header>

        {/* 탭 전환 스위치 */}
        <div className="level-switch">
          <div className="level-switch-track">
            <button
              type="button"
              className={`level-btn ${level === 'basic' ? 'active' : ''}`}
              data-accent="green"
              onClick={() => onLevelChange('basic')}
            >
              🐥 베이직 (컴맹 탈출)
            </button>
            <button
              type="button"
              className={`level-btn ${level === 'advanced' ? 'active' : ''}`}
              data-accent="plum"
              onClick={() => onLevelChange('advanced')}
            >
              🔥 어드밴스 (크리에이터)
            </button>
          </div>
        </div>

        {/* 진행 상태 바 + 아니오 목록 */}
        <div className="progress-panel">
          <div className="progress-row">
            <span className="progress-label">{LEVEL_LABEL[level]}</span>
            <span className="progress-value">{progressPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" data-accent={accent} style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="no-list-panel">
            <div className="no-list-info">
              <span className="no-list-label">아니오 목록{noIds.length > 0 ? ` (${noIds.length})` : ''}</span>
              {noIds.length > 0 ? (
                <div className="no-list-chips">
                  {noIds.map((id) => (
                    <span className="no-chip" key={id}>
                      {id}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="no-list-empty">아직 '아니오'로 답한 문항이 없어요</span>
              )}
            </div>
            <button
              type="button"
              className={`copy-button ${copyStatus === 'copied' ? 'copied' : ''}`}
              disabled={noIds.length === 0}
              onClick={handleCopyNoList}
            >
              {copyStatus === 'copied' ? '복사됨! ✓' : '복사하기'}
            </button>
          </div>
        </div>

        {/* 문항 리스트 */}
        <div className="section-list">
          {currentTestData.map((part, index) => {
            const answeredInPart = part.questions.filter((q) => answers.has(q.id)).length;
            return (
              <section className="section" key={index}>
                <div className="section-header">
                  <h2 className="section-title">{part.title}</h2>
                  <span className="section-count">
                    {answeredInPart} / {part.questions.length}
                  </span>
                </div>
                <div className="question-list">
                  {part.questions.map((q) => {
                    const status = answers.get(q.id);
                    return (
                      <div key={q.id}>
                        {q.group && <div className="question-group-label">{q.group}</div>}
                        <div className="question" data-accent={accent} data-answer={status}>
                          <span className="question-index">{q.id}</span>
                          <span className="question-text">{q.text}</span>
                          <div className="answer-toggle" role="group" aria-label={`문항 ${q.id} 응답`}>
                            <button
                              type="button"
                              className={`answer-btn answer-yes ${status === 'yes' ? 'selected' : ''}`}
                              data-accent={accent}
                              aria-pressed={status === 'yes'}
                              onClick={() => handleAnswer(q.id, 'yes')}
                            >
                              예
                            </button>
                            <button
                              type="button"
                              className={`answer-btn answer-no ${status === 'no' ? 'selected' : ''}`}
                              aria-pressed={status === 'no'}
                              onClick={() => handleAnswer(q.id, 'no')}
                            >
                              아니오
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* 결과 보기 버튼 영역 */}
        <div className="cta-wrap">
          {!showResult ? (
            <>
              <button
                type="button"
                className="cta-button"
                data-accent={accent}
                disabled={!allAnswered}
                aria-describedby={!allAnswered ? 'cta-helper' : undefined}
                onClick={() => setShowResult(true)}
              >
                내 결과 확인하기 ✨
              </button>
              {!allAnswered && (
                <p className="cta-helper" id="cta-helper">
                  {remainingCount}개 문항이 아직 비어있어요
                </p>
              )}
            </>
          ) : (
            <div className="result-card">
              <div
                className="result-ring"
                style={{ '--percent': scorePercent, '--ring-color': result.ringColor } as CSSProperties}
              >
                <span className="result-emoji">{result.emoji}</span>
              </div>
              <h3 className="result-title">{result.title}</h3>
              <p className="result-desc">{result.desc}</p>

              <div className="result-score">
                <span className="result-score-label">획득 점수</span>
                <span className="result-score-num">{yesCount}</span>
                <span className="result-score-total">/ {totalQuestions}</span>
              </div>

              <button type="button" className="report-link-button" data-accent={accent} onClick={onViewReport}>
                📊 자세한 성적표 보기
              </button>

              <button
                type="button"
                className="retry-button"
                onClick={() => {
                  resetTest();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                다시 테스트하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
