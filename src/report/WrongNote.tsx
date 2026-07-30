import { useEffect, useRef, useState } from 'react';
import { testData, type Answer, type Level } from '../testData';
import { mockBasicReport, mockAdvancedReport, type PartFeedback, type PartScore } from './mockData';
import { PART_QUESTION_IDS } from './reportMeta';
import { getStudyPages, type StudyPage } from './studyContent';

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

type Row = { part: PartScore; wrongIds: number[]; feedback: PartFeedback | undefined };

function StudyPager({ pages }: { pages: StudyPage[] }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const current = pages[pageIndex];

  const goTo = (i: number) => {
    setPageIndex(i);
    setSelectedChoice(null);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(pageIndex - 1)}
          disabled={pageIndex === 0}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="이전 페이지"
        >
          ‹
        </button>

        <div className="min-h-[140px] flex-1 rounded-2xl bg-slate-50 p-4">
          {current.type === 'explanation' ? (
            <>
              {current.content && <p className="text-sm leading-relaxed text-slate-700">{current.content}</p>}
              {current.image && (
                <img src={current.image} alt="" className="mt-3 w-full rounded-xl border border-slate-200" />
              )}
            </>
          ) : (
            <>
              {current.quizQuestion && (
                <p className="text-sm font-semibold text-slate-800">{current.quizQuestion}</p>
              )}
              <div className="mt-3 flex flex-col gap-2">
                {(current.choices ?? []).map((choice) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrect = choice === current.answer;
                  const showResult = selectedChoice !== null;
                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setSelectedChoice(choice)}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                        showResult && isCorrect
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                          : showResult && isSelected
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
              {selectedChoice !== null && (
                <p
                  className={`mt-2 text-sm font-bold ${
                    selectedChoice === current.answer ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {selectedChoice === current.answer ? '정답이에요! ✓' : `아쉬워요. 정답은 "${current.answer}"예요.`}
                </p>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => goTo(pageIndex + 1)}
          disabled={pageIndex === pages.length - 1}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>

      {pages.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {pages.map((p, i) => (
            <button
              key={p.page}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`${i + 1}번 페이지로 이동`}
              className={`h-2 rounded-full transition-all ${
                i === pageIndex ? 'w-5 bg-indigo-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StudyModal({
  id,
  text,
  row,
  reviewed,
  onToggleReviewed,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  id: number;
  text: string | undefined;
  row: Row;
  reviewed: boolean;
  onToggleReviewed: () => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">{row.part.title}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex gap-3 rounded-2xl bg-red-50/70 p-4">
          <span className="font-bold text-red-500">{id}</span>
          <span className="text-base font-medium leading-relaxed text-slate-800">{text}</span>
        </div>

        {(() => {
          const pages = getStudyPages(id);
          if (pages.length > 0) return <StudyPager key={id} pages={pages} />;
          if (row.feedback)
            return (
              <div className="mt-4 rounded-2xl bg-indigo-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">복습 코멘트</p>
                <p className="mt-1.5 text-sm leading-relaxed text-indigo-900">{row.feedback.comment}</p>
                <p className="mt-2 text-sm font-semibold text-indigo-700">👉 {row.feedback.actionPlan}</p>
              </div>
            );
          return null;
        })()}

        <button
          type="button"
          onClick={onToggleReviewed}
          className={`mt-5 w-full rounded-full py-2.5 text-sm font-bold transition ${
            reviewed
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-slate-900 text-white hover:bg-slate-700'
          }`}
        >
          {reviewed ? '✓ 복습 완료' : '복습 완료로 표시'}
        </button>

        <div className="mt-3 flex justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← 이전 문항
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-30"
          >
            다음 문항 →
          </button>
        </div>
      </div>
    </div>
  );
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
  const [reviewedByLevel, setReviewedByLevel] = useState<Record<Level, Set<number>>>({
    basic: new Set(),
    advanced: new Set(),
  });
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
  const reviewed = reviewedByLevel[level];

  const rows: Row[] = template.parts
    .map((part, i) => {
      const ids = partIdLists[i] ?? [];
      const wrongIds = ids.filter((id) => answers.get(id) === 'no');
      const feedback = template.feedback.find((f) => f.id === part.id);
      return { part, wrongIds, feedback };
    })
    .filter((row) => row.wrongIds.length > 0);

  const flatWrongIds = rows.flatMap((r) => r.wrongIds);
  const totalWrong = flatWrongIds.length;
  const allWrongLines = rows.flatMap((r) => r.wrongIds.map((id) => `${id}. ${questionText.get(id)}`));

  const rowForId = (id: number) => rows.find((r) => r.wrongIds.includes(id));

  const toggleReviewed = (id: number) => {
    setReviewedByLevel((prev) => {
      const next = new Set(prev[level]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [level]: next };
    });
  };

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
    setSelectedId(null);
  };

  const selectedIndex = selectedId !== null ? flatWrongIds.indexOf(selectedId) : -1;
  const selectedRow = selectedId !== null ? rowForId(selectedId) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 px-6 py-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">📕 오답노트</h1>
            {totalWrong > 0 && (
              <span className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-bold text-red-700">
                총 {totalWrong}개 문항 · {reviewed.size}개 복습 완료
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
                {row.wrongIds.map((id) => {
                  const isReviewed = reviewed.has(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(id)}
                        className={`flex w-full gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                          isReviewed
                            ? 'bg-emerald-50/70 hover:bg-emerald-100/70'
                            : 'bg-red-50/60 hover:bg-red-100/60'
                        }`}
                      >
                        <span className={`font-bold ${isReviewed ? 'text-emerald-500' : 'text-red-500'}`}>
                          {isReviewed ? '✓' : id}
                        </span>
                        <span className={isReviewed ? 'text-slate-500 line-through' : 'text-slate-700'}>
                          {questionText.get(id)}
                        </span>
                      </button>
                    </li>
                  );
                })}
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

      {selectedId !== null && selectedRow && (
        <StudyModal
          id={selectedId}
          text={questionText.get(selectedId)}
          row={selectedRow}
          reviewed={reviewed.has(selectedId)}
          onToggleReviewed={() => toggleReviewed(selectedId)}
          onClose={() => setSelectedId(null)}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex >= 0 && selectedIndex < flatWrongIds.length - 1}
          onPrev={() => setSelectedId(flatWrongIds[selectedIndex - 1])}
          onNext={() => setSelectedId(flatWrongIds[selectedIndex + 1])}
        />
      )}
    </div>
  );
}
