import { useEffect, useRef, useState } from 'react';
import { testData, type Answer, type Level } from '../testData';
import { mockBasicReport, mockAdvancedReport } from './mockData';
import { PART_QUESTION_IDS } from './reportMeta';

const REPORT_TEMPLATE = { basic: mockBasicReport, advanced: mockAdvancedReport };

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

function buildQuestionTextMap(level: Level): Map<number, string> {
  const map = new Map<number, string>();
  for (const part of testData[level]) {
    for (const q of part.questions) map.set(q.id, q.text);
  }
  return map;
}

export default function WrongNote({
  answersByLevel,
  onStartTest,
}: {
  answersByLevel: Record<Level, Map<number, Answer>>;
  onStartTest: (level: Level) => void;
}) {
  const [level, setLevel] = useState<Level>('basic');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
    },
    [],
  );

  const answers = answersByLevel[level];
  const template = REPORT_TEMPLATE[level];
  const questionText = buildQuestionTextMap(level);
  const partIdLists = PART_QUESTION_IDS[level];

  const rows = template.parts
    .map((part, i) => {
      const ids = partIdLists[i] ?? [];
      const wrongIds = ids.filter((id) => answers.get(id) === 'no');
      const feedback = template.feedback.find((f) => f.id === part.id);
      return { part, wrongIds, feedback };
    })
    .filter((row) => row.wrongIds.length > 0);

  const totalWrong = rows.reduce((sum, r) => sum + r.wrongIds.length, 0);
  const allWrongLines = rows.flatMap((r) => r.wrongIds.map((id) => `${id}. ${questionText.get(id)}`));

  const handleCopyAll = () => {
    if (allWrongLines.length === 0) return;
    const text = allWrongLines.join('\n');
    const flash = () => {
      setCopyStatus('copied');
      if (copyTimeoutRef.current !== null) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => setCopyStatus('idle'), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(flash)
        .catch(() => {
          if (legacyCopy(text)) flash();
        });
    } else if (legacyCopy(text)) {
      flash();
    }
  };

  const handleLevelChange = (l: Level) => {
    setLevel(l);
    setCopyStatus('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 px-6 py-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">📕 오답노트</h1>
            {totalWrong > 0 && (
              <span className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold text-red-700">
                총 {totalWrong}개 문항
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleLevelChange('basic')}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  level === 'basic' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🐥 베이직
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange('advanced')}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  level === 'advanced' ? 'bg-white text-purple-600 shadow' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🔥 어드밴스
              </button>
            </div>
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={allWrongLines.length === 0}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copyStatus === 'copied' ? '복사됨! ✓' : '전체 복사'}
            </button>
          </div>
        </header>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/60 bg-white/60 py-14 text-center shadow-xl shadow-slate-900/5 backdrop-blur-xl">
            {answers.size === 0 ? (
              <>
                <span className="text-4xl">📝</span>
                <p className="text-lg font-bold text-slate-800">아직 답변한 문항이 없어요</p>
                <p className="max-w-sm text-sm text-slate-500">
                  자가진단 테스트를 풀면 틀린 문항이 여기에 자동으로 모여요.
                </p>
                <button
                  type="button"
                  onClick={() => onStartTest(level)}
                  className="mt-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  📝 지금 테스트 하러 가기
                </button>
              </>
            ) : (
              <>
                <span className="text-4xl">🎉</span>
                <p className="text-lg font-bold text-slate-800">지금까지 틀린 문항이 없어요!</p>
              </>
            )}
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.part.id}
              className="rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-800">{row.part.title}</h2>
                <span className="flex-shrink-0 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                  {row.wrongIds.length} / {row.part.questionCount} 틀림
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {row.wrongIds.map((id) => (
                  <li key={id} className="flex gap-3 rounded-xl bg-red-50/60 px-4 py-3 text-sm">
                    <span className="font-bold text-red-500">{id}</span>
                    <span className="text-slate-700">{questionText.get(id)}</span>
                  </li>
                ))}
              </ul>
              {row.feedback && (
                <div className="mt-4 rounded-2xl bg-indigo-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">복습 코멘트</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-indigo-900">{row.feedback.comment}</p>
                  <p className="mt-2 text-sm font-semibold text-indigo-700">👉 {row.feedback.actionPlan}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
